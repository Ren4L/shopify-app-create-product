import {TitleBar, useNavigate} from "@shopify/app-bridge-react";
import {
    Form,
    Page,
    FormLayout,
    TextField,
    Button,
    Select,
    LegacyStack,
    DropZone,
    Banner,
    List,Thumbnail,Text, Loading, Frame
} from "@shopify/polaris";
import {useState, useEffect} from "react";
import {useAppQuery, useAuthenticatedFetch} from "../hooks/index.js";

export default function Create() {
    const {data = [], isLoading} = useAppQuery({url:"/api/collections/getAll"});
    const navigate = useNavigate();
    const authenticatedFetch = useAuthenticatedFetch();
    const [options, setOptions] = useState([]);
    const [Product, setProduct] = useState({name:undefined, price:undefined, image:undefined, description: undefined, collection:options[0]?.value});

    useEffect(()=>{
        if (!isLoading){
            setOptions(data.map((el) => el.value = el.title.toLowerCase()));
            setProduct({...Product, collection: data[0].title.toLowerCase()});
        }
    }, [isLoading]);

    const handleSubmit = async (e) => {
        for (const productKey in Product) {
            if(Product[productKey] || productKey === 'image') continue;
            alert(`The field ${productKey} is not filled`);
            return;
        }
        let form = new FormData();
        form.append('file', Product.image);
        form.append("product", JSON.stringify({...Product, image:undefined}));
        const data = await authenticatedFetch("/api/products/create",
            {
                method: 'POST',
                body: form
            });
        if (await data.json()) {
            alert("Item added successfully");
        }
    };

    const [rejectedFiles, setRejectedFiles] = useState([]);
    const hasError = rejectedFiles.length > 0;

    const handleDrop = (_droppedFiles, acceptedFiles, rejectedFiles) => {
        setProduct({...Product, image: acceptedFiles[0]});
        setRejectedFiles(rejectedFiles);
    };

    const fileUpload = !Product?.image?.length && <DropZone.FileUpload />;
    const uploadedFiles = Product.image && (
        <LegacyStack vertical>
             {Product.image &&
                 <LegacyStack alignment="center">
                     <Thumbnail
                         size="small"
                         alt={Product.image.name}
                         source={window.URL.createObjectURL(Product.image)}
                     />
                     <div>
                         {Product.image.name}{' '}
                         <Text variant="bodySm" as="p">
                             {Product.image.size} bytes
                        </Text>
                    </div>
                </LegacyStack>
            }
        </LegacyStack>
    );

    const errorMessage = hasError && (
        <Banner
            title="The following images couldn’t be uploaded:"
            status="critical"
        >
            <List type="bullet">
                {rejectedFiles.map((file, index) => (
                    <List.Item key={index}>
                        {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
                    </List.Item>
                ))}
            </List>
        </Banner>
    );

    return (
        <Page>
            <TitleBar
                title="Create product"
                primaryAction={{
                    content: "All product",
                    onAction: () => navigate("/"),
                }}
            />
            {isLoading ? <Frame><Loading /></Frame> :
                <Form onSubmit={handleSubmit}>
                    <FormLayout>
                        <TextField
                            value={Product.name}
                            onChange={(value) => setProduct({...Product, name: value})}
                            label="Name"
                            type="text"
                            autoComplete="off"
                        />
                        <TextField
                            value={Product.price}
                            onChange={(value) => setProduct({...Product, price: +value})}
                            label="Price"
                            type="number"
                            autoComplete="off"
                        />

                        <TextField
                            label="Description"
                            value={Product.description}
                            onChange={(value) => setProduct({...Product, description: value})}
                            multiline={4}
                            autoComplete="off"
                        />
                        <Select
                            label="Collection"
                            options={options}
                            onChange={(value) => setProduct({...Product, collection: value})}
                            value={Product.collection}
                        />
                        <LegacyStack vertical>
                            {errorMessage}
                            <DropZone accept="image/*" type="image" onDrop={handleDrop}>
                                {uploadedFiles}
                                {fileUpload}
                            </DropZone>
                        </LegacyStack>
                        <Button submit>Submit</Button>
                    </FormLayout>
                </Form>
            }
        </Page>
    );
}
