import axios from "axios";

// Serper parametrejä ja playground. Voi etsiä location,images,shoppinh yms
export async function searchSerperImages(query: string) {
  const response = await axios.post(
    "https://google.serper.dev/images",
    {
      q: query,
      num: 5,
      gl: "fi", // Set country to Finland
      location: "Finland",
      // On vielä location parametri, mutta en tiedä tekeekö tällä mitään koska gl,hl kohdat ovat jo finland. location: "Finland",
      hl: "fi", // Set language to Finnish
      // Tähän voi lisätä myös Data-Range asetuksen "tbs", jolla voi rajata hakutuloksia aikavälin mukaan PastDay, PastWeek, PastMonth, PastYear etc.
    },
    {
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

// Palauttaa vain tietyt kentät
export async function searchSerperImagesFiltered(query: string) {
  const response = await searchSerperImages(query);

  if (response && response.images) {
    return response.images.map((image: any) => ({
      title: image.title,
      productUrl: image.link,
      domain: image.domain,
      picUrl: image.imageUrl,
    }));
  }

  return [];
}
