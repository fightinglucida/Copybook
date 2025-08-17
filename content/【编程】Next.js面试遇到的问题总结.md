---
title: 【编程】Next.js面试遇到的问题总结
categories: 编程
mood: empty
tags:
  - 编程
  - AI
---

# 2025最好的Next.js面试题（一）

最近在面试，就写一些关于问到的面试题，同时也过一下知识点。

## 基础概念
### 什么是Next.js？它与React的关系是什么？

Next.js是一个基于React的全栈开发框架，由Vercel开发和维护。它在React的基础上提供了额外的功能和优化，如服务器组件(Server Components)、流式渲染(Streaming)、服务器操作(Server Actions)等。

我认为Next.js最大的价值在于它简化了React应用的开发流程，特别是在处理服务器端渲染和路由方面，使我们能够构建高性能、SEO友好的应用，而无需从零开始配置复杂的工具链。

### Next.js 14有哪些主要特性？这些特性如何提升开发体验？

我认为Next.js 14的主要特性包括：

- React Server Components: 默认使用服务器组件，减少客户端JavaScript体积，提升性能

- App Router: 基于文件夹的路由系统，支持布局、加载状态和错误处理，简化路由管理

- 服务器操作(Server Actions): 直接在组件中定义服务器端逻辑，无需创建API路由

- 流式渲染(Streaming): 逐步渲染UI，提高用户体验和感知性能

- Turbopack: 基于Rust的打包工具，提供更快的开发体验和热重载

- 内置优化: 自动图像、字体和脚本优化，无需额外配置

- SEO优化: 内置元数据API和结构化数据支持，提升搜索引擎可见性

- 国际化路由: 内置的多语言支持，简化国际化应用开发

- Middleware: 请求处理中间件，实现认证、重定向等功能

这些特性共同提升了开发体验，使我们能够更快地构建高性能、可维护的应用。

### 解释Next.js的App Router是如何工作的？它与Pages Router有何不同？

App Router是Next.js 13+引入的基于文件夹的路由系统，它使用约定式路由，通过文件夹结构自动创建路由：

- 核心概念: 使用app目录组织路由结构，每个路由段对应一个文件夹

- 特殊文件约定:

- page.js: 定义路由UI和公开访问点

- layout.js: 定义共享布局，可嵌套

- loading.js: 创建加载UI，自动集成Suspense

- error.js: 处理错误，自动集成Error Boundary

- not-found.js: 处理404错误

- 高级功能:

支持嵌套路由和布局

路由组(Route Groups): 使用(groupName)语法组织路由而不影响URL结构

平行路由(Parallel Routes): 使用@folder语法在同一页面显示多个路由

拦截路由(Intercepting Routes): 使用(.)、(..)、(...)语法拦截路由，如模态框

示例结构：
```hljs language-bash
app/
├── layout.js      # 根布局
├── page.js        # 首页
├── about/
│   └── page.js    # /about 路由
├── blog/
│   ├── layout.js  # 博客布局
│   ├── page.js    # /blog 路由
│   └── [slug]/
│       └── page.js # /blog/[slug] 动态路由
```

与Pages Router相比，App Router的主要区别：

1. 服务器组件: App Router默认使用React服务器组件，而Pages Router使用客户端组件

2. 布局系统: App Router提供了更强大的嵌套布局系统，Pages Router需要使用自定义_app.js

3. 数据获取: App Router允许在组件中直接使用async/await，Pages Router使用getServerSideProps等函数

4. 文件约定: App Router使用page.js表示路由，Pages Router使用index.js或命名文件

5. 路由分组: App Router支持路由组、平行路由和拦截路由等高级功能

在实际项目中，App Router提供了更灵活、更强大的路由系统，特别适合构建复杂的应用。

## 渲染相关
### 组件的渲染模式和页面的渲染策略有什么区别?

这实际很容易搞混和不好理解。

组件渲染模式关注的是单个组件如何被处理和执行，通常的表述是：服务端组件(Server Components)、客户端组件(Client Components)。

页面渲染策略关注的是整个页面的生成时机和缓存行为，通常的表述是：静态站点生成(SSG)、服务器端渲染(SSR)、增量静态再生成(ISR)、客户端渲染(CSR)。

### 组件的渲染模式通过什么指令来标识？

App Router不标识就默认是Server组件，客户端组件使用use client，服务端组件use server。

### 那是什么决定了页面的渲染方式那？

在不强制申明路由段的情况下，由Next的分析工具在打包的时候自己分析的情况下：

- cookies()、headers()、unstable_noStore()等服务端系列Api会强制把页面设置为SSR渲染，如果在layout下使用，下属页面均为SSR。

- 使用服务端请求了在页面里，为SRR。

- generateStaticParams函数的使用会使动态路由页面在构建时预渲染，走SSG，在构建的时候就生成HTML页面。

- 默认情况下，在不满足上述条件的页面会被标记为 “静态路由(Static)”，也相当于构建的时候生成HTML。

如果强制申明路由段的情况下，在Page页码下通过约定的字段声明，会高于打包工具分析。但force-static会导致上面提到的第一种情况的服务端Api结果返空，通常我们只会去设置ISR的重新验证时间。
```hljs language-javascript
// 强制使用静态渲染
export const dynamic = 'force-static'

// 强制使用动态渲染
export const dynamic = 'force-dynamic'

// 按需使用动态渲染
export const dynamic = 'auto'

// 设置ISR重新验证时间
export const revalidate = 60 // 60秒
```

### 你提到了路由段的字段声明，你知道revalidate如何能无限期缓存吗？

设为false.

### 在服务端渲染中流式渲染是为了解决什么问题？

过去SSR需要等待服务端渲染完毕、组件代码打包到bundle、完成水合后才能操作。Streaming SSR可以一边渲染一边传输。

### 一般怎么触发流式渲染？使用场景是什么？

核心是采用Suspense在渲染的时候用一个占位符替代，等在服务端请求完毕，再流式传输给html，替代之前占位符，用loading.js、page内的suspense都可以触发这种流式渲染。 流式渲染特别适合包含多个独立数据区域的页面。

### 当你使用流式渲染的时候，同时要使用动态的MetaData API做SEO，会发生什么？

流式渲染不会触发（或者说没有意义），因为MetaData需要完整的TDK在第一时间就展示，就必须先等待generateMetadata的请求先完成。实验版本中有streamingMetadata的设置，可以流式传输TDK。

### 当一个’use server’的组件下面嵌套了多个’use client’，'use client’的组件内容会在服务器返回的document中展示吗？

当一个标记为’use server’的服务器组件下嵌套了多个标记为’use client’的客户端组件时，这些客户端组件的内容会在服务器返回的初始HTML文档中展示。
这是因为：

1. 服务器渲染过程：服务器组件及其所有子组件(包括客户端组件)都会在服务器上进行初始渲染，生成HTML。

2. 客户端组件的特殊处理：对于标记了’use client’的组件，Next.js会：

- 在服务器上渲染其初始HTML

- 将组件的JavaScript代码分离出来，作为单独的客户端bundle

- 在HTML中插入必要的标记，以便客户端水合

1. 水合(Hydration)过程：当HTML加载到浏览器后，React会"水合"这些客户端组件，使它们变为可交互状态。这个过程会：

- 加载客户端组件的JavaScript

- 将事件监听器附加到已渲染的HTML元素上

- 建立组件状态和生命周期

因此，'use client’指令并不意味着组件仅在客户端渲染，而是表示该组件需要在客户端进行水合和交互处理。

## 服务端组件相关
## 服务端组件有哪些特性和限制？

服务端组件在服务器上渲染，不发送JavaScript到客户端。适用于不需要客户端交互的UI部分，可以显著减少JavaScript包大小，可以直接连接数据库、文件系统或其他后端服务，无需中间API层，内容在服务器端渲染，搜索引擎可以更好地索引页面内容。

服务端组件不能使用React Hooks、浏览器API、事件处理器。不能响应客户端组件的状态变化，从服务端组件传递给客户端组件的props必须是可序列化的（不能是函数或类实例）。

### 当使用了Server Components我们经常能见到带着rsc的请求在浏览器上，这是什么？

当我们在浏览器开发工具的网络面板中看到带有"rsc"的请求时，这些是React Server Components (RSC)的数据流请求。“rsc"代表"React Server Components”，这是Next.js和React的服务器组件架构的核心部分。

这些请求的工作原理如下：

1. RSC Payload: 这些请求返回的是一种特殊格式的数据，称为RSC Payload（服务器组件负载）。它包含了服务器组件的渲染结果，以一种React客户端可以理解和处理的格式。

2. 流式传输: 这些请求通常使用HTTP流（Stream）传输数据，允许浏览器逐步接收和处理服务器组件的渲染结果，而不必等待整个响应完成。

3. 客户端-服务器边界: 当客户端组件需要渲染服务器组件的子组件时，这些RSC请求会被触发，建立客户端和服务器之间的通信桥梁。

4. 导航和重新渲染: 当用户在应用中导航或触发需要新服务器组件的操作时，浏览器会发出新的RSC请求来获取更新的组件数据。

这些请求的存在是Next.js的App Router架构工作方式的直接结果。在这种架构中，服务器组件在服务器上渲染，然后将结果发送到客户端，而客户端组件则在浏览器中渲染。这种混合渲染模式需要客户端和服务器之间的通信机制，这就是我们看到的RSC请求。

# 结束

实际上，还有很多有关于Nextjs的面试题是可以问的，关于缓存、Edge Runtime、MetaData、ServerActions… 后面有机会再写吧，欢迎一起分享交流。

 
