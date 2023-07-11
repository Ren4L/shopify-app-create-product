import shopify from "./shopify.js";

const CREATE_PRODUCTS_MUTATION = `
  query getCollection {
  collections(first: 250) {
    nodes {
      title
    }
  }
}

`;

export async function getAllCollection(session) {
  const client = new shopify.api.clients.Graphql({ session });
  try {
    return await client.query({
      data: {
        query: CREATE_PRODUCTS_MUTATION,
      },
    });
  } catch {
    return false
  }
}

