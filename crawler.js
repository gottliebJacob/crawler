import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';

const results = [];
const alreadyVisited = {};

const re = new RegExp('^(?:[a-z+]+:)?//', 'i');

const fixUrl = (url, link) => {
    if (!link) {
        return '';
    } else if (re.test(link)) {
        return link;
    } else if (link.startsWith('/') || link.startsWith('#')) {
        return `${new URL(url).origin}${link}`;
    } else {
        return `${new URL(url).origin}/${link}`;
    }
}

const crawl = async (url, depth) => {
    try {
        if (!alreadyVisited[url]) {

            alreadyVisited[url] = true;

            const response = await axios.get(url);

            if (response.status === 200) {

                const $ = cheerio.load(response.data);

                $('img').each((_, img) => {
                    results.push({
                        imageUrl: fixUrl(url, img.attribs.src),
                        sourceUrl: url,
                        depth
                    })
                });

                if (depth < process.argv[3]) {
                    const links = $('a').toArray();
                    for (let link of links) {
                        await crawl(fixUrl(url, link.attribs.href), depth + 1);
                    }
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
}

await crawl(process.argv[2], 0);

fs.writeFile('results.json', JSON.stringify(results), (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Done!');
    }
});