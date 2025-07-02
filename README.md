# Copy Book

Copy book is a collection of texts that are commonly used around the web.

## Development

You need [Hugo](https://gohugo.io/) to run the dev server. If you have [Homebrew](https://brew.sh/) you can do the following:

```sh
brew install hugo
```

Check this [Hugo installation page](https://gohugo.io/getting-started/installing/) for installing on other systems.

Then clone the repo, install dependencies, and start the server locally.

```sh
git clone https://github.com/praveenjuge/copybook.git
cd copybook
npm install
npm run dev
```

Open [`http://localhost:1313`](http://localhost:1313) in your browser.

| Scripts         | Description                                     |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Starts a local Hugo server and Tailwind Watcher |
| `npm run build` | For generating production files                 |

## License

See the [LICENSE](https://github.com/praveenjuge/copybook/blob/main/LICENSE) file.

## 网站内容管理

本章节提供关于如何管理和自定义网站内容的详细说明。

### 1. 如何新增文章

我们已经为您配置了内容模板（Archetype），您可以通过以下 Hugo 命令快速创建一篇新文章：

```sh
hugo new your-article-title.md
```

- 将 `your-article-title.md` 替换为您想要的文件名（建议使用英文、数字和连字符）。
- 该命令会在 `content` 目录下生成一个新的 Markdown 文件。
- 文件会自动填充预设的元数据，例如标题（根据文件名生成）、日期，并默认为草稿（`draft: true`）。

打开新创建的文件，您会看到如下结构：

```markdown
---
title: "Your Article Title"
date: 2023-10-27T10:00:00Z
draft: true
mood: ""
category: ""
tags: [""]
---

**在这里写下您的文章内容。**
```

- **完成写作后**：将 `draft: true` 改为 `draft: false` 或直接删除该行，文章才会在网站上显示。

### 2. 元数据（Front Matter）解释

每篇文章头部的 `---` 包裹区域是元数据，用于控制文章的属性：

- `title`: 文章标题。
- `date`: 发布日期。
- `draft`: 是否为草稿。`true` 表示是，文章不会被发布。
- `mood`: 心情或文章基调。例如：`Direct`, `Creative`。
- `category`: 文章分类。例如：`Marketing`, `Tech`。
- `tags`: 文章标签，可以有多个。例如：`["upsell", "features"]`。

这些分类和标签有助于组织和筛选内容。

### 3. 如何修改网站配置 (`config.toml`)

网站的主要配置都在根目录的 `config.toml` 文件中。

#### 修改域名

要修改网站的访问地址，请更新 `baseURL` 参数：

```toml
baseURL = "https://your-new-domain.com/"
```

#### 修改网站标题和描述

```toml
title = "您的网站标题"
[params]
  description = "您的网站描述。"
  sitename = "您的网站名称"
```

#### 修改作者信息

```toml
[params.author]
  name = "您的名字"
  avatar = "/images/your-avatar.png" # 头像路径
  bio = "您的简介"
```

### 4. 如何修改网站图标 (Favicon)

网站图标是显示在浏览器标签页上的小图片。

1.  准备一个图标文件，通常命名为 `favicon.ico`、`favicon.png` 或 `favicon.svg`。
2.  将您的图标文件放入 `static/` 目录下。
3.  更新 `layouts/_default/baseof.html` 文件中指向图标的链接。找到类似下面这行代码：

    ```html
    <link rel="icon" href="/favicon.ico">
    ```

    确保 `href` 的路径与您存放图标的路径一致。

### 5. 本地预览与构建

在对网站进行修改时，您可以使用以下命令在本地预览效果：

- **本地开发服务器**：
  ```sh
  npm run dev
  ```
  这会启动一个实时刷新的本地服务器，默认地址是 `http://localhost:1313`。

- **生成生产文件**：
  ```sh
  npm run build
  ```
  这个命令会清除旧的构建文件，并重新生成所有静态网站文件到 `public` 目录。这些文件是最终可以部署到服务器上的版本。

