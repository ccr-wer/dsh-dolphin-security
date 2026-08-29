# Agent Note: 预检响应改为静态 allow-headers，通配 CORS 作为设计保留

Status: implemented

## Problem

市场 worker 的 OPTIONS 预检原样反射请求中的 `access-control-request-headers`，对外展示一个无上限的自定义头面，且随着处理器开始读取新头会静默扩大。同一份审计还提出写端点上的 `access-control-allow-origin: *` 是否应收紧或移除：它使任意网站的访客浏览器都能跨域驱动写入。

## Decision

`preflight()` 现在固定应答 `access-control-allow-headers: content-type`——所有被预检的处理器唯一读取的头——不再反射请求内容。`access-control-allow-origin: *` 是有意保留并在代码中注明的设计：合法写入方是嵌在各用户自有 DSH GUI 源（loopback、LAN 主机、自定义域名，无法枚举）中的 MarketCard，固定源会让产品功能整体失效；写入的真正滥用边界是 Turnstile 加 manifest 白名单，而不是 CORS，且这些端点不使用任何 cookie 或凭据。

## Alternatives considered

移除 POST 端点的 CORS 或把允许源固定为 dsh-market.com 的方案被否决：来自各 GUI 源的浏览器预检会全部失败，点赞/安装对所有用户失效——这里的 CORS 是承重设计而非装饰。只对「请求头与已知头的交集」做反射的方案被否决：唯一需要的头就是 content-type，增加复杂度没有收益。经挑战 iframe 的跨域 token 农场是相关的残余风险，单独跟踪（合法嵌框方同样是这些任意 GUI 源，需要产品层决策）。

## Consequences

预检响应不再回显攻击者挑选的头名称；四条预检路径对真实客户端行为完全一致（它们只发送 content-type）。通配 ACAO 作为有意识的、在代码中注明取舍的设计保留。

## Testing

`node --test scripts/market-worker.test.mjs`（36 项全过），含新增用例：即使预检请求携带任意头名称，响应也只返回静态列表。
