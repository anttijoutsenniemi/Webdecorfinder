import axios from "axios";
import dedent from "dedent";
import webSearchQuery from '../styleJson/webSearch.json';

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