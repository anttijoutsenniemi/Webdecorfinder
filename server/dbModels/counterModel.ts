import { MongoClient } from 'mongodb';

const counterModel = () => {
    const url : string = process.env.MONGO_ATLAS_URI ?? "";
    // const client = new MongoClient(url);
    const client = new MongoClient(url, { maxPoolSize: 5, maxIdleTimeMS: 30000 }); //reduce the amount of connections
    const dbName = 'redecofinderData';

    const collection = `counterCollection`;
    const db = client.db(dbName);
    const counterCollection = db.collection(collection);

    client.connect().catch(error => {
        console.error('Failed to connect to MongoDB:', error);
    });

    // Function to update the counter document
    const updateFeedbackCounter = async (wasAIrecommendationGood: boolean) => {
        try {
            const updateQuery = {
                $inc: {
                    timesFeedbackWasgiven: 1,
                    ...(wasAIrecommendationGood ? { timesAIrecosWereGood: 1 } : {}),
                },
            };

            const result = await counterCollection.updateOne(
                { id: "counterDocument" }, 
                updateQuery
            );

            return result;
        } catch (error) {
            console.error('Updating feedback counter failed with status code 102');
            throw error;
        }
    };

    // Define more functions as needed

    return {
        updateFeedbackCounter,
        // Add more functions to export here
    };
}

export default counterModel;