import axios from "axios";

// Serper API vastauksen rakenne
interface SerperSearchParameters {
  q: string;
  gl: string;
  hl: string;
  type: string;
  location: string;
  engine: string;
}

interface SerperShoppingItem {
  title: string;
  source: string;
  link: string;
  price: string;
  imageUrl: string;
  rating?: number;
  ratingCount?: number;
  offers?: string;
  position: number;
}

interface SerperResponse {
  searchParameters: SerperSearchParameters;
  shopping: SerperShoppingItem[];
  credits: number;
}

// Filtteröity ShoppingItem
interface FilteredSearchResult {
  title: string;
  productUrl: string; // link kentästä
  picUrl: string; // imageUrl kentästä
  domain: string; // source kentästä
  price?: number; // uusi kenttä, mutta optional
  position?: number; // uusi kenttä, mutta optional
}

function cleanPrice(priceStr: string): number {
  if (!priceStr) return 0;
  const numStr = priceStr
    .replace(/€/g, "")
    .replace(/käytetty/g, "")
    .replace(/\s/g, "")
    .replace(/,/g, ".")
    .trim();
  const price = parseFloat(numStr);
  return isNaN(price) ? 0 : parseFloat(price.toFixed(2)); // Pyöristää 2 desimaalin tarkkuuteen
}

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

// Serper WebStore search
export async function searchSerperWebStores(
  query: string
): Promise<SerperResponse> {
  try {
    const data = {
      q: query,
      location: "Finland",
      gl: "fi",
      hl: "fi",
    };

    const config = {
      method: "post",
      url: "https://google.serper.dev/shopping",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response.data;
  } catch (error: any) {
    console.error("Serper API error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

// WebStore search muutetaan palauttamaan sama muoto
export async function searchSerperWebStoresFiltered(
  query: string
): Promise<FilteredSearchResult[]> {
  console.log('query saatu', query);
  const response = await searchSerperWebStores(query);

  if (!response.shopping) {
    return [];
  }

  return response.shopping.map((item) => ({
    title: item.title,
    productUrl: item.link, // muutettu link -> productUrl
    picUrl: item.imageUrl, // muutettu imageUrl -> picUrl
    domain: item.source, // muutettu source -> domain
    price: cleanPrice(item.price),
    position: item.position,
  }));
}
