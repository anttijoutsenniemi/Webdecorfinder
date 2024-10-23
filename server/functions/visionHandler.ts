import axios from "axios";
import dedent from "dedent";
import furnitureStyles from '../styleJson/furnitureStyle.json';
import singleFurniture from '../styleJson/singleFurniture.json';
import webSearchQuery from '../styleJson/webSearch.json';

export const fetchInterPretationWithReference = async (userFilledData : string, refPic64 : string[]) => {
    try {
    //this is for testing, comment this return statement to enable Ai
    //   return dedent`{
    //     "nonValidImage": false,
    //     "explanation": "",
    //     "colorThemes": {
    //         "dark": 0,
    //         "light": 0,
    //         "colorful": 0,
    //         "earthy": 0,
    //         "blackAndWhite": 0,
    //         "pastel": 0,
    //         "neutrals": 0,
    //         "jewelTones": 0,
    //         "metallics": 0,
    //         "oceanic": 0
    //     },
    //     "designStyles": {
    //         "industrial": 0,
    //         "scandinavian": 0,
    //         "minimalist": 0,
    //         "modern": 0,
    //         "farmhouse": 0,
    //         "artDeco": 0,
    //         "bohemian": 0,
    //         "traditional": 0,
    //         "rustic": 0,
    //         "glam": 0,
    //         "contemporary": 0,
    //         "transitional": 0
    //     }
    // }`
      
      const apiKey = process.env.OPENAI_API_KEY;
      //const fillableJson = JSON.stringify(furnitureStyles);
      const fillableJson = JSON.stringify(furnitureStyles);
      
      //our initial prompt with userfilleddata and stylejson
      let contentArray : object[] = [
        {
            type: "text",
            text: dedent`Im looking for furniture attributes that fit the following description: ${userFilledData}. You can also
                  take inspiration from the reference pictures provided by user. Your mission is to give each of the furniture attributes
                  in the given JSON a valuation between 0-100 on how well they would fit the given info. 
                  In explanation key write your reasoning in finnish why attributes with high valuation would fit.
                  If the image is not valid please only fill nonValidImage key as true. Fill this JSON and return
                  it only: ${fillableJson}`
        }
      ]

      //here we add each picture as an object in to the contentarray that will be sent to openai
      for(let i = 0; i < refPic64.length && i < 4; i++){
        if(refPic64[i]){
          let newObject : object = {
            type: "image_url",
            image_url: {
              url: refPic64[i]
            },
          }
          contentArray.push(newObject);
        }
      }
      
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        
        {
          //model: "gpt-4-turbo",
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: contentArray,
            },
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )
      //console.log(result.data.choices[0].message.content);
      let answer = result.data.choices[0].message.content;
      return answer;
    } catch (error) {
      console.log("Error occured getting ai response: ", error);
      return false
    } 
  };

  export const fetchStyleForSingleFurniture = async (furniturePicUrl : string) => {
    try {
      //this is for testing, comment this return statement to enable Ai
      // return dedent`{
        //     "colorThemes": {
        //       "dark": 100,
        //       "light": 0,
        //       "colorful": 0,
        //       "earthy": 0,
        //       "blackAndWhite": 0,
        //       "pastel": 0,
        //       "neutrals": 0,
        //       "jewelTones": 0,
        //       "metallics": 0,
        //       "oceanic": 0
        //   },
        //   "designStyles": {
        //       "industrial": 0,
        //       "scandinavian": 0,
        //       "minimalist": 100,
        //       "modern": 0,
        //       "farmhouse": 0,
        //       "artDeco": 0,
        //       "bohemian": 0,
        //       "traditional": 0,
        //       "rustic": 0,
        //       "glam": 0,
        //       "contemporary": 0,
        //       "transitional": 0
        //   }
        // }`
      
      const apiKey = process.env.OPENAI_API_KEY;
      //const fillableJson = JSON.stringify(furnitureStyles);
      const fillableJson = JSON.stringify(singleFurniture);
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          //model: "gpt-4-turbo",
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
              {
                  type: "text",
                  text: dedent`Could you help me to make an estimation on the color themes and style values of the furniture in this image?
                        I will give you a JSON where you can fill in 0-100 rating on the color themes and style values that you think describe
                        the furniture the best. Fill this JSON and return it only: ${fillableJson}`
              },
              {
                  type: "image_url",
                  image_url: {
                    url: `${furniturePicUrl}`
                    //url: "https://images.tori.fi/api/v1/imagestori/images/100261082365.jpg?rule=medium_660",
                  },
              },
              ],
            },
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )
      let answer = result.data.choices[0].message.content;
      return answer;
    } catch (error) {
      console.log("Error occured getting ai response: ", error);
      return false
    } 
  };

  export const fetchInterPretationWithSpaceImg = async (refPic64 : string[]) => {
    try {
    //this is for testing, comment this return statement to enable Ai
    //   return dedent`{
    //     "nonValidImage": false,
    //     "explanation": "",
    //     "colorThemes": {
    //         "dark": 0,
    //         "light": 0,
    //         "colorful": 0,
    //         "earthy": 0,
    //         "blackAndWhite": 0,
    //         "pastel": 0,
    //         "neutrals": 0,
    //         "jewelTones": 0,
    //         "metallics": 0,
    //         "oceanic": 0
    //     },
    //     "designStyles": {
    //         "industrial": 0,
    //         "scandinavian": 0,
    //         "minimalist": 0,
    //         "modern": 0,
    //         "farmhouse": 0,
    //         "artDeco": 0,
    //         "bohemian": 0,
    //         "traditional": 0,
    //         "rustic": 0,
    //         "glam": 0,
    //         "contemporary": 0,
    //         "transitional": 0
    //     }
    // }`
      
      const apiKey = process.env.OPENAI_API_KEY;
      //const fillableJson = JSON.stringify(furnitureStyles);
      const fillableJson = JSON.stringify(furnitureStyles);
      
      //our initial prompt with userfilleddata and stylejson
      let contentArray : object[] = [
        {
            type: "text",
            text: dedent`Im looking for furniture attributes that fit the given pictures of space im interior designing. 
                  Your mission is to give each of the furniture attributes
                  in the given JSON a valuation between 0-100 on how well they would fit the given pictures. 
                  In explanation key write your reasoning in finnish on why certain style and color attributes would fit. 
                  If the image is not valid please only fill nonValidImage key as true. Fill this JSON and return
                  it only: ${fillableJson}`
        }
      ]

      //here we add each picture as an object in to the contentarray that will be sent to openai
      for(let i = 0; i < refPic64.length && i < 4; i++){
        if(refPic64[i]){
          let newObject : object = {
            type: "image_url",
            image_url: {
              url: refPic64[i]
            },
          }
          contentArray.push(newObject);
        }
      }
      
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        
        {
          //model: "gpt-4-turbo",
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: contentArray,
            },
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )
      //console.log(result.data.choices[0].message.content);
      let answer = result.data.choices[0].message.content;
      return answer;
    } catch (error) {
      console.log("Error occured getting ai response: ", error);
      return false
    } 
  };

  export const fetchInterPretationWithOnlyText = async (userFilledData : string) => {
    try {
    //this is for testing, comment this return statement to enable Ai
    //   return dedent`{
    //     "nonValidImage": false,
    //     "explanation": "",
    //     "colorThemes": {
    //         "dark": 0,
    //         "light": 0,
    //         "colorful": 0,
    //         "earthy": 20,
    //         "blackAndWhite": 0,
    //         "pastel": 0,
    //         "neutrals": 0,
    //         "jewelTones": 0,
    //         "metallics": 0,
    //         "oceanic": 0
    //     },
    //     "designStyles": {
    //         "industrial": 0,
    //         "scandinavian": 0,
    //         "minimalist": 0,
    //         "modern": 0,
    //         "farmhouse": 0,
    //         "artDeco": 0,
    //         "bohemian": 0,
    //         "traditional": 40,
    //         "rustic": 0,
    //         "glam": 0,
    //         "contemporary": 0,
    //         "transitional": 0
    //     }
    // }`
      
      const apiKey = process.env.OPENAI_API_KEY;
      //const fillableJson = JSON.stringify(furnitureStyles);
      const fillableJson = JSON.stringify(furnitureStyles);
      
      //our initial prompt with userfilleddata and stylejson
      let contentArray : object[] = [
        {
            type: "text",
            text: dedent`Im looking for furniture attributes that fit the following description: ${userFilledData}.
                  Your mission is to give each of the furniture attributes
                  in the given JSON a valuation between 0-100 on how well they would fit the given info. 
                  In explanation key write your reasoning in finnish why attributes with high valuation would fit.
                  If the image is not valid please only fill nonValidImage key as true. Fill this JSON and return
                  it only: ${fillableJson}`
        }
      ]
      
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        
        {
          //model: "gpt-4-turbo",
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: contentArray,
            },
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )
      //console.log(result.data.choices[0].message.content);
      let answer = result.data.choices[0].message.content;
      return answer;
    } catch (error) {
      console.log("Error occured getting ai response: ", error);
      return false
    } 
  };

  export const fetchInterPretationForWebSearch = async (refPic64 : string[], category: string) => {
    try {
    //this is for testing, comment to enable ai
    // return `{
    //     "webSearchQuery": "Dark and minimalistic chair",
    //     "explanation": "Tilalla on puhdas ja uudenlainen esteettinen tunnelma, joten tummat ja minimalistiset huonekalut täydentävät sitä hyvin.",
    //     "nonValidImage": false
    // }`
      const apiKey = process.env.OPENAI_API_KEY;
      const fillableJson = JSON.stringify(webSearchQuery);
      
      //our initial prompt with userfilleddata and stylejson
      let contentArray : object[] = [
        {
            type: "text",
            text: dedent`Im interior designing the space in the image/images. Im looking for mainly used furniture in the category: ${category}. 
                  Your mission is to analyze what style & colorthemed furniture would fit the space and write the perfect web search query 
                  in finnish that would help me find matching furniture for the space. 
                  In explanation key write your reasoning in finnish on why certain style and color attributes would fit. 
                  If some images are not valid please only fill nonValidImage key as true. Fill this JSON and return
                  it only: ${fillableJson}`
        }
      ]

      //here we add each picture as an object in to the contentarray that will be sent to openai
      for(let i = 0; i < refPic64.length && i < 4; i++){
        if(refPic64[i]){
          let newObject : object = {
            type: "image_url",
            image_url: {
              url: refPic64[i]
            },
          }
          contentArray.push(newObject);
        }
      }
      
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        
        {
          //model: "gpt-4-turbo",
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: contentArray,
            },
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )
      //console.log(result.data.choices[0].message.content);
      let answer = result.data.choices[0].message.content;
      return answer;
    } catch (error) {
      console.log("Error occured getting ai response: ", error);
      return false
    } 
  };