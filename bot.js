const puppeteer = require('puppeteer');
const cron = require('node-cron');
const getRandomNumber = require('./fns');
const resultArr = require('./index')
const TelegramBot = require('node-telegram-bot-api');
const token = '7501233722:AAFT3LU4DG3W62W9TQ6SqJ64cKuEpDTKnMw';
const bot = new TelegramBot(token, { polling: true });
let result = []
let addedId = ['224611785']
let users = []
///adada12cbg
///lavochka_halyavochka
const channelId = "@adada12cbg"
console.log(resultArr)
async function sendParseDate() {
  if (addedId.length > 600) addedId = ['224611785']
  const fetchPromises = resultArr.map(async (elem) => {
    const url = elem[getRandomNumber(0, elem.length - 1)];

    const response = await fetch(url, {
      headers: {
        accept: "*/*",
        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,la;q=0.6",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referrer-Policy": "no-referrer-when-downgrade"
      },
      body: null,
      method: "GET"
    });
    console.log(response.status)
    const res = await response.json();
    let element = res.data.products.find((elem) => {
      return !addedId.includes(String(elem.id)) && elem.sizes[elem.sizes.length - 1].price.product / 100 <= 1000;
    })
    console.log(element)
    result.push([
      `\n\n🛒<b>Название</b>: <i>${element.name}</i>`,
      `\n*Id товара*:`,
      `${element.id}`,
      `\n💲<b>цена без скидки</b>: <s>${element.sizes[element.sizes.length - 1].price.basic / 100}</s>`,
      `\n💸<b>цена со скидкой</b>: <b><u>${element.sizes[element.sizes.length - 1].price.product / 100}</u></b>`,
      `\n🔗<b>ссылка на товар</b>: <a href="https://www.wildberries.ru/catalog/${element.id}/detail.aspx?targetUrl=SP">Ссылка на товар</a>`
    ]);
  });

  // Ждем завершения всех запросов
  await Promise.all(fetchPromises).then(async () => {
    console.log("Все запросы завершены, массив result заполнен:");
    console.log(result); // Здесь массив result будет полностью заполнен
    addedId = Array.from(new Set(addedId))
    result = result.slice(0, 2)
    result.forEach((elem) => {
      addedId.push(elem[2]);
    });

    // Теперь выполняем асинхронные операции с Puppeteer
    const browser = await puppeteer.launch();
    const puppeteerPromises = result.map(async (elem) => {

      const page = await browser.newPage();

      // Переходим на страницу товара
      await page.goto(`https://www.wildberries.ru/catalog/${elem[2]}/detail.aspx?targetUrl=SP`, {
        waitUntil: 'networkidle2',
        timeout: 80000 // Увеличиваем тайм-аут до 60 секунд
      });

      // Получаем ссылки на изображения
      const imageSrcs = await page.evaluate(() => {
        const images = document.querySelectorAll('.zoom-image-container img');
        return Array.from(images).map(img => img.src);
      });

      // Добавляем ссылку на изображение в массив
      if (!elem.includes(`${imageSrcs[0]}`)) elem.push(`${imageSrcs[0]}`);
      console.log(imageSrcs[0], elem)
      // // Закрываем браузер
      // await browser.close();
    });

    // Ждем завершения всех операций с Puppeteer
    await Promise.all(puppeteerPromises).then(async () => {
      await browser.close();
      // Отправляем сообщения пользователям
      // users.forEach((elem) => {
      //   if (result.toString().trim().length > 0) {
      //     bot.sendMessage(elem, result.slice(0, 5).toString().replaceAll(',', '')); // Массив со ссылками
      //   }
      // });
      console.log(result, 'Х')

      result.forEach(async (elem)=>{
        await bot.sendPhoto(channelId, String(elem[elem.length-1]),{
          caption: String(elem.slice(0,1) + elem.slice(3,elem.length-1)),
          parse_mode: 'HTML' // Используем Markdown для разметки
      })
      })

      result = [];
    })



    // Очистка массива result и установка res в false
    console.log(addedId, addedId.length);
  })



}
cron.schedule('*/01 10-20 * * *', function () {
  console.log('Запуск функции каждые 20 минут с 7 утра до 7 вечера');
  sendParseDate().catch(error => {
    console.error("Произошла ошибка:", error);
  });
});

// bot.setMyCommands(
//   [
//     {
//       command: "/start",
//       description: "Начать работу",
//     }
//   ]
// )
// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   if (msg.text === '/start' || msg.text === '⭐️ Начать') {
//     if (!users.includes(chatId)) {
//       users.push(chatId)
//       sendParseDate()
//       bot.sendMessage(chatId, '*бот запущен*\n ожидайте результаты', {
//         parse_mode: "MarkdownV2"
//       });
//       result = []
//       cron.schedule('*/20 7-18 * * *', function () {
//         sendParseDate()
//       });
//     } else {
//       bot.sendMessage(chatId, '*бот уже работет*\n ожидайте результаты', {
//         parse_mode: "MarkdownV2"
//       });
//     }


//   }
// })
