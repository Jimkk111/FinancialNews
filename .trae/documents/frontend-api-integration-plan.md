# 前端集成后端API计划

## 项目现状分析

### 当前架构
```
src/
├── services/          # 服务层 - 当前调用本地模拟数据
│   ├── userService.ts
│   ├── newsService.ts
│   ├── newsEditorService.ts
│   └── aiService.ts
├── data/              # 本地模拟数据 - 需要删除
│   ├── ai.ts
│   ├── favorite.ts
│   ├── news.ts
│   ├── newsDraft.ts
│   └── user.ts
├── stores/            # 状态管理
│   └── auth.ts
└── types/             # 类型定义 - 保持不变
```

### 需要修改的内容
1. 新建 `src/api/` 目录，封装axios请求
2. 重写 `src/services/` 下的服务，调用真实API
3. 删除 `src/data/` 目录
4. 配置环境变量

---

## 实施步骤

### 第一步：安装依赖和配置

#### 1.1 安装axios
```bash
npm install axios
```

#### 1.2 配置环境变量
创建 `.env.development` 和 `.env.production`:
```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production
VITE_API_BASE_URL=https://your-domain.com/api
```

---

### 第二步：创建API封装层

#### 2.1 创建 `src/api/request.ts`
封装axios实例，包含：
- 基础URL配置
- 请求拦截器（自动添加Token）
- 响应拦截器（统一错误处理）
- Token过期自动跳转登录

#### 2.2 创建各模块API文件
```
src/api/
├── request.ts       # axios封装
├── auth.ts          # 认证API
├── user.ts          # 用户API
├── news.ts          # 新闻API
├── favorite.ts      # 收藏API
├── history.ts       # 历史API
├── draft.ts         # 草稿API
└── ai.ts            # AI助手API
```

---

### 第三步：重写服务层

#### 3.1 修改 `src/services/userService.ts`
| 函数 | 改动 |
|------|------|
| `login()` | 调用 `POST /api/auth/login` |
| `register()` | 调用 `POST /api/auth/register` |
| `sendCode()` | 调用 `POST /api/auth/send-code` |
| `resetPassword()` | 调用 `POST /api/auth/reset-password` |
| `uploadAvatar()` | 调用 `POST /api/users/me/avatar` |
| `getFavorites()` | 调用 `GET /api/favorites` |
| `addFavorite()` | 调用 `POST /api/favorites` |
| `removeFavorite()` | 调用 `DELETE /api/favorites/:newsId` |
| `checkFavorite()` | 调用 `GET /api/favorites/check/:newsId` |
| `getHistory()` | 调用 `GET /api/history` |
| `addHistory()` | 调用 `POST /api/history` |
| `clearHistory()` | 调用 `DELETE /api/history` |

#### 3.2 修改 `src/services/newsService.ts`
| 函数 | 改动 |
|------|------|
| `getNewsList()` | 调用 `GET /api/news` |
| `getNewsDetail()` | 调用 `GET /api/news/:id` |
| `incrementNewsViews()` | 调用 `POST /api/news/:id/views` |
| `getNewsCategories()` | 调用 `GET /api/news/categories` |
| `searchNews()` | 调用 `GET /api/news/search` |

#### 3.3 修改 `src/services/newsEditorService.ts`
| 函数 | 改动 |
|------|------|
| `getDraftsList()` | 调用 `GET /api/drafts` |
| `getDraft()` | 调用 `GET /api/drafts/:id` |
| `saveDraftService()` | 调用 `POST /api/drafts` |
| `deleteDraftService()` | 调用 `DELETE /api/drafts/:id` |
| `publishNewsService()` | 调用 `POST /api/drafts/:id/publish` |
| `getPublishedList()` | 调用 `GET /api/news?source=user` 或新端点 |
| `uploadImage()` | 调用 `POST /api/upload/image` |

#### 3.4 修改 `src/services/aiService.ts`
| 函数 | 改动 |
|------|------|
| `createSession()` | 调用 `POST /api/ai/sessions` |
| `getSessions()` | 调用 `GET /api/ai/sessions` |
| `getSessionMessages()` | 调用 `GET /api/ai/sessions/:id/messages` |
| `updateSessionTitle()` | 调用 `PUT /api/ai/sessions/:id` |
| `deleteSession()` | 调用 `DELETE /api/ai/sessions/:id` |
| `chatCompletion()` | 调用 `POST /api/ai/chat` |
| `healthCheck()` | 调用 `GET /api/ai/health` |

---

### 第四步：更新状态管理

#### 4.1 修改 `src/stores/auth.ts`
- 添加 `updateUser()` 方法
- 添加 `refreshUser()` 方法（从服务器获取最新用户信息）
- 处理Token过期逻辑

---

### 第五步：删除模拟数据

删除以下文件：
```
src/data/
├── ai.ts
├── favorite.ts
├── news.ts
├── newsDraft.ts
└── user.ts
```

---

### 第六步：处理边界情况

#### 6.1 网络错误处理
- 请求失败时显示友好提示
- 支持请求重试

#### 6.2 Token过期处理
- 401响应时自动清除本地存储
- 跳转到登录页面

#### 6.3 加载状态
- 统一loading状态管理
- 防止重复请求

---

## 文件改动清单

### 新建文件
| 文件路径 | 说明 |
|----------|------|
| `src/api/request.ts` | axios封装 |
| `src/api/auth.ts` | 认证API |
| `src/api/user.ts` | 用户API |
| `src/api/news.ts` | 新闻API |
| `src/api/favorite.ts` | 收藏API |
| `src/api/history.ts` | 历史API |
| `src/api/draft.ts` | 草稿API |
| `src/api/ai.ts` | AI助手API |
| `.env.development` | 开发环境变量 |
| `.env.production` | 生产环境变量 |

### 修改文件
| 文件路径 | 改动说明 |
|----------|----------|
| `src/services/userService.ts` | 改为调用API |
| `src/services/newsService.ts` | 改为调用API |
| `src/services/newsEditorService.ts` | 改为调用API |
| `src/services/aiService.ts` | 改为调用API |
| `src/stores/auth.ts` | 添加新方法 |

### 删除文件
| 文件路径 | 说明 |
|----------|------|
| `src/data/ai.ts` | 删除模拟数据 |
| `src/data/favorite.ts` | 删除模拟数据 |
| `src/data/news.ts` | 删除模拟数据 |
| `src/data/newsDraft.ts` | 删除模拟数据 |
| `src/data/user.ts` | 删除模拟数据 |

---

## 执行顺序

1. **安装axios，配置环境变量**
2. **创建 `src/api/request.ts`**（axios封装）
3. **创建各API模块文件**
4. **逐个修改服务层文件**（按模块顺序：auth → news → favorite → history → draft → ai）
5. **更新状态管理**
6. **删除 `src/data/` 目录**
7. **测试验证**
