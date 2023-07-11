import { useNavigate, TitleBar} from "@shopify/app-bridge-react";
import {
    Layout,
    Page,
    Loading, Frame, HorizontalGrid, LegacyCard, TextContainer, Image
} from "@shopify/polaris";
import {useAppQuery} from "../hooks/index.js";

export default function HomePage() {
    const {data, isLoading} = useAppQuery({url:"/api/products/getAll"})
    const navigate = useNavigate();

    const allProducts = () => {
        // console.log(data.data[5]);
        // return;
        return (
            <HorizontalGrid gap="4" columns={3}>
                {data.data.map((el)=>{
                    return(
                        <LegacyCard key={el.id} title={el.title} sectioned>
                            <LegacyCard.Section flush>
                                <Image
                                    source={el.images[0]?.src || "https://static.vecteezy.com/system/resources/previews/005/720/408/original/crossed-image-icon-picture-not-available-delete-picture-symbol-free-vector.jpg"}
                                    alt={el.title}
                                    style={{borderRadius: '10px'}} width="100%"
                                />
                            </LegacyCard.Section>
                            <LegacyCard.Section subdued>
                                <TextContainer>Price: {el.variants[0].price}$</TextContainer>
                                <TextContainer>Id: {el.id}</TextContainer>
                                <div dangerouslySetInnerHTML={{__html:el.body_html}}></div>
                            </LegacyCard.Section>
                        </LegacyCard>
                    );
                } )}
            </HorizontalGrid>
        )
    };

    return (
        <Page>
            <TitleBar
                title="All product"
                primaryAction={{
                    content: "Create product",
                    onAction: () => navigate("/Create"),
                }}
            />
            <Layout>
                <Layout.Section>
                    {isLoading ? <Frame><Loading /></Frame> : allProducts()}
                </Layout.Section>
            </Layout>
        </Page>
    );
}
