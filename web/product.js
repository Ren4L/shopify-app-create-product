import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";

const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
      }
    }
  }
`;

export async function createProduct(session, product) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    return await client.query({
      data: {
        query: CREATE_PRODUCTS_MUTATION,
        variables: {
          input: {
            title: `${product.name}`,
            variants: [{ price: `${product.price}` }],
            bodyHtml: `${product.description}`,
            tags:[`${product.collection}`]
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}
