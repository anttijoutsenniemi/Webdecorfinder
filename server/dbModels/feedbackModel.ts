import { MongoClient } from 'mongodb';

interface FeedbackData {
    feedback: string;
}

const feedbackModel = () => {
    const url : string = process.env.MONGO_ATLAS_URI ?? "";
    // const client = new MongoClient(url);
    const client = new MongoClient(url, { maxPoolSize: 5, maxIdleTimeMS: 30000 }); //reduce the amount of connections
    const dbName = 'redecofinderData';

    const collection = `feedbackCollection`;
    const db = client.db(dbName);
    const feedbackCollection = db.collection(collection);

    client.connect().catch(error => {
        console.error('Failed to connect to MongoDB:', error);
    });

    //add one datacell to document
    const addData = async (feedbackData : FeedbackData) => {
        try {
            const result = await feedbackCollection.insertOne(feedbackData);
            return result;
        } catch (error) {
            console.error('Connection to test db failed with status code 102');
            throw error;
        } 
    }

    // Define more functions as needed

    return {
        addData,
        // Add more functions to export here
    };
}

export default feedbackModel;