# xieyuexing-backend

Node.js + Express 后台应用，支持 JWT 认证。

## 快速开始

1. 安装依赖：
    ```bash
    npm install
    ```
2. 启动服务：
    ```bash
    npm run dev
    ```

## 主要接口

- `POST /api/auth/register` 用户注册
- `POST /api/auth/login` 用户登录，返回 JWT
- `GET /api/user/profile` 获取用户信息（需携带 JWT）

## 配置

- `.env` 文件中可配置端口和 JWT 密钥

## 目录结构

- controllers/ 控制器
- routes/ 路由
- middlewares/ 中间件
- utils/ 工具
- config/ 配置

---

如需持久化存储，请自行接入数据库。
