/// <reference types="vite/client" />

// 消费方均为 Vite：组件源码里的 import.meta.env.DEV（如 Select searchable 的
// 非文本 children 开发警告）依赖 vite/client 的 ImportMeta 类型。
// work-dispatcher 原文件里的 __BUILD_ID__ 声明属其业务，不随包迁移。
