const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const { format } = require('date-fns');

// leo 26442036
// roy 23007329
const code = 26442036;

const fetchData = async (code) => {
  return new Promise((resolve, reject) => {
    request({
      url: `https://www.strava.com/athletes/${code}`,
      method: "GET"
    }, (error, response, body) => {
      if (error || !body) {
        reject(error);
        return;
      }
      const $ = cheerio.load(body); // 載入 body
      const dom = $("[data-react-class=AthleteProfileApp]");
      const props = dom.prop('data-react-props');
      const result = (props);
      resolve(result);
    });
  })
};

const saveFile = ({ path, context, callback }) => {
  fs.writeFileSync(path, context, callback)
}

const fetchOneAndSave = async ({ code }) => {
  const jsonStr = await fetchData(code);
  const user = JSON.parse(jsonStr);
  const date = format(new Date(), 'yyyy-MM-dd');
  const folderPath = `data/${date}`;

  if (!fs.existsSync(folderPath)){
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const username = user.athlete.name.toLowerCase().replace(/\s/gi, '-');
  const path = `${folderPath}/${username}`;
  return new Promise((resolve) => {
    saveFile({
      path,
      context: jsonStr,
      callback: () => { resolve() }
    });
  })
}

const init = async () => {
  const usersCode = [
    26442036, // leo
    23007329, // roy
    18022498, // hunter
  ];
  Promise.all(
    usersCode.map(async code => {
      return fetchOneAndSave({ code })
    })
  )
}

init();