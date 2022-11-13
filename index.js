import fs from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';

const results = [];
let maxDepth = 1;

const re = new RegExp('^(?:[a-z+]+:)?//', 'i');

const fixUrl = (baseUrl, link) => {
    if (re.test(link)) {
        return link;
    } else if (link.startsWith('/') || link.startsWith('#')) {
        return `${baseUrl}${link}`;
    } else {
        return `${baseUrl}/${link}`;
    }
}

const crawl = async (url, depth) => {
    try {
        const response = await axios.get(url);

        if (response.status === 200) {


            const $ = cheerio.load(response.data);

            $('img').each((_, img) => results.push({
                imageUrl: img.attribs.src,
                sourceUrl: url,
                depth: depth
            }));

            if (depth < maxDepth) {
                $('a').map((_, link) => {
                    if (link.attribs.href[0] !== '#')
                        crawl(fixUrl(new URL(url).origin, link.attribs.href), depth + 1);
                })
            }
        }
    } catch (err) {
        console.log(err)
    }
}

crawl('https://www.npmjs.com/package/cheerio', 0)
    .then(() => console.log(results));