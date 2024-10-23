import { MongoClient } from 'mongodb';

export interface StyleJson {
    nonValidImage: boolean,
    explanation: string,
    colorThemes: {
        dark: number,
        light: number,
        colorful: number,
        earthy: number,
        blackAndWhite: number,
        pastel: number,
        neutrals: number,
        jewelTones: number,
        metallics: number,
        oceanic: number
    },
    designStyles: {
        industrial: number,
        scandinavian: number,
        minimalist: number,
        modern: number,
        farmhouse: number,
        artDeco: number,
        bohemian: number,
        traditional: number,
        rustic: number,
        glam: number,
        contemporary: number,
        transitional: number
    }
}

export interface ScrapingData {
    picUrl: string;
    title: string;
    quantity: string;
    price: string;
    productUrl: string;
    styleJson?: StyleJson
}

const furnitureModel = (furnitureCategory : string) => {
    const url : string = process.env.MONGO_ATLAS_URI ?? "";
    // const client = new MongoClient(url);
    const client = new MongoClient(url, { maxPoolSize: 5, maxIdleTimeMS: 30000 }); //reduce the amount of connections
    const dbName = 'redecofinderData';

    const collection = `${furnitureCategory}Collection`;
    const db = client.db(dbName);
    const furnitureCollection = db.collection(collection);

    client.connect().catch(error => {
        console.error('Failed to connect to MongoDB:', error);
    });

    //find one by id and return it as json
    const fetchOneWithStyles = async (title : string) => {
        try {
            const result = await furnitureCollection.findOne({title : title, styleJson: { $exists: true }});
            return result;
        } catch (error) {
            console.error('Connection to productInfo document failed with status code 100: ', error);
            throw error;
        } 
    }
    
    //find all data and return an array
    const fetchData = async () => {
        try {
            const result = await furnitureCollection.find({
                styleJson: { $exists: true },
                deleted: false
            }).toArray();
            return result;
        } catch (error) {
            console.error('Connection to test db failed with status code 101');
            throw error;
        } 
    }

    //fetch data with minimum quantity available
    const fetchDataWithQuantity = async (minQuantity : number) => {
        try {
            const result = await furnitureCollection.find({
                styleJson: { $exists: true },
                deleted: false
            }).toArray();
    
            // Extract and filter based on the quantity
            const filteredResult = result.filter(item => {
                // Extract the number from the quantity string
                const quantityMatch = item.quantity.match(/Varastossa (\d+) kpl/);
                const quantityNumber = quantityMatch ? parseInt(quantityMatch[1], 10) : 0;
    
                // Return true if the quantity is greater than or equal to minQuantity
                return quantityNumber >= minQuantity;
            });
    
            return filteredResult;
        } catch (error) {
            console.error('Connection to test db failed with status code 99');
            throw error;
        }
    };
    

    //add one datacell to document
    const addData = async (scrapingData : ScrapingData) => {
        try {
            const result = await furnitureCollection.insertOne(scrapingData);
            return result;
        } catch (error) {
            console.error('Connection to test db failed with status code 102');
            throw error;
        } 
    }

    //check products deleted from webshop and update deleted boolean value
    const checkDeletedAndUpdate = async (titleArray : string[]) => {
        try {
            const query = { title: { $nin: titleArray } };
            const update = { $set: { deleted: true } };
            const result = await furnitureCollection.updateMany(query, update);
        } catch (error) {
            console.error('Connection to test db failed with status code 102');
            throw error;
        } 
    }

    //update product deleted value back to false
    const updateDeleted = async (title : string) => {
        try {
            const query = { title: title };
            const update = { $set: { deleted: false } };
            const result = await furnitureCollection.updateOne(query, update);
        } catch (error) {
            console.error('Connection to test db failed with status code 102');
            throw error;
        } 
    }

    // Define more functions as needed

    return {
        fetchOneWithStyles,
        fetchData,
        addData,
        checkDeletedAndUpdate,
        updateDeleted,
        fetchDataWithQuantity
        // Add more functions to export here
    };
}

export default furnitureModel;