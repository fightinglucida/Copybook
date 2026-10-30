import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createAvatar} from '@dicebear/core';
import {notionists} from '@dicebear/collection';
const root=path.dirname(fileURLToPath(import.meta.url));
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'preview-data.js'),'utf8'),context);
const palette=['ceeddc','d5e5ff','ffe3b4','e6d7ff','c7ebe3','ffd6df'];
const avatars={};
for(const post of context.window.PREVIEW_DATA.posts){
  const seed='copybook:'+post.file;
  const svg=createAvatar(notionists,{seed,backgroundColor:palette,size:80,radius:12}).toString();
  avatars[post.id]='data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64');
}
const toImage=name=>'data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,'assets',name)).toString('base64');
const imageDemo={id:'image-example',title:'图文排版示例：把值得学的，收集起来',category:'学习资料',tags:['学习','工具','资源'],date:'2026-10-30T12:00:00+08:00',downloads:context.window.PREVIEW_DATA.posts.find(p=>p.downloads.baidu&&p.downloads.quark).downloads,body:`这是一篇用于审核正文排版的独立示例。图片与文字交错呈现，资源下载区放在完整正文之后。\n\n![资源整理主题示意图](${toImage('resource-overview.svg')} "宽幅图片自适应正文宽度，点击可以放大查看。")\n\n## 图文穿插，让内容更容易理解\n\n正文可以插入课程封面、操作截图、资源目录或作品预览。图片保持原始比例，和前后段落留出适当间距；窄屏下自动缩小，避免横向滚动。\n\n> 图片在正文中直接展示，图注用于补充说明。\n\n## 读完介绍，再获取资源\n\n![发现、阅读与实践的步骤示意图](${toImage('resource-reading.svg')} "段落中的第二张配图示例。")\n\n1. 先阅读资源说明，判断是否符合自己的需要。\n2. 结合图片了解内容范围和使用方式。\n3. 在文末选择网盘，复制提取码后获取资源。\n\n这里是正文的最后一段。下方进入统一的资源下载区域。\n\n*此页仅用于展示图片排版，下载链接沿用站内既有链接，不代表示例图片对应一套新资源。*`};
fs.writeFileSync(path.join(root,'media-data.js'),'window.PREVIEW_AVATARS='+JSON.stringify(avatars)+';\nwindow.PREVIEW_IMAGE_DEMO='+JSON.stringify(imageDemo)+';\n');
const vendor=path.join(root,'assets','vendor');fs.mkdirSync(vendor,{recursive:true});
fs.copyFileSync(path.join(root,'node_modules','marked','lib','marked.umd.js'),path.join(vendor,'marked.umd.js'));
fs.copyFileSync(path.join(root,'node_modules','dompurify','dist','purify.min.js'),path.join(vendor,'purify.min.js'));
for(const [pkg,label] of [['marked','Marked'],['dompurify','DOMPurify']]){const folder=path.join(root,'node_modules',pkg);const file=fs.readdirSync(folder).find(name=>/^license/i.test(name));if(file)fs.copyFileSync(path.join(folder,file),path.join(root,'assets',label+'-LICENSE.txt'));}
fs.writeFileSync(path.join(root,'assets','Avatar-LICENSE.txt'),'Avatar style: Notionists by Zoish\nSource: https://www.dicebear.com/styles/notionists/\nLicense: CC0 1.0 https://creativecommons.org/publicdomain/zero/1.0/\nGenerated locally with DiceBear core 9.4.3 / collection 9.4.2 (core MIT license).\n');
console.log('Generated '+Object.keys(avatars).length+' stable SVG avatars and a separate illustrated article fixture.');
