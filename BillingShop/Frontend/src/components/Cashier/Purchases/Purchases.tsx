    import Navbar from "../Navbar";
    import BillForm from "../Billform";

    const Purchases = () => {
    return (
        <>
        <Navbar
            title="Create Purchase Invoice"
            backPath="/purchases"
            showSettings
            uploadAction={{
            label: "Upload using Phone",
            onClick: () => console.log("Upload from phone"),
            }}
            secondaryAction={{
            label: "Save & New",
            onClick: () => console.log("Save & New"),
            }}
            primaryAction={{
            label: "Save",
            onClick: () => console.log("Save"),
            }}
        />

        {/* 👇 THIS IS THE IMPORTANT PART */}
        <BillForm mode="purchase" />
        </>
    );
    };

    export default Purchases;
