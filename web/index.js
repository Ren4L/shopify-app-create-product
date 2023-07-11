// @ts-check
import { join } from "path";
import { readFileSync, unlinkSync } from "fs";
import express from "express";
import fileUpload from 'express-fileupload'
import serveStatic from "serve-static";
import bodyParser from 'body-parser';

import shopify from "./shopify.js";
import {createProduct} from "./product.js";
import {getAllCollection} from './collection.js';
import GDPRWebhookHandlers from "./gdpr.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);


app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(express.static('public'));
app.use(express.json());
app.use(fileUpload());

app.get("/api/products/getAll", async (_req, res) => {
  const Data = await shopify.api.rest.Product.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(Data);
});

app.get("/api/collections/getAll", async (_req, res) =>{
  const Data = await getAllCollection(res.locals.shopify.session);
  res.status(200).send(Data?.body?.data?.collections?.nodes);
})

app.post("/api/products/create", async (_req, res)=>{
  let product = JSON.parse(_req.body.product);
  let newProduct = await createProduct(res.locals.shopify.session, product)
  let id = +newProduct?.body?.data?.productCreate?.product?.id?.match(/[0-9]{1,}/gm)[0];
  if (!_req.files) {
    return res.status(200).json(true)
  }
  const myFile = _req.files.file;
  await myFile.mv(`./public/${myFile.name}`);
  let file = await readFileSync(`./public/${myFile.name}`, "base64");
  const image = new shopify.api.rest.Image({session:res.locals.shopify.session});
  image.product_id = id;
  image.position = 1;
  image.attachment = file;
  image.filename = myFile.name;
  await image.save({
    update: true,
  });
  await unlinkSync(`./public/${myFile.name}`);
  res.status(200).json(true);
})

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await createProduct(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
