# Third-Party Notices

Dolphin (`dsh-dolphin-security`) 包含或派生自以下开源项目。依据各自许可证的要求，
其原始版权声明与许可条款在此保留。完整许可证原文见 `THIRD_PARTY_LICENSES/` 目录。

本项目自身代码以 MIT 许可证发布，见 `LICENSE`。

---

## 1. GitLab SAST Rules

- **来源**：https://gitlab.com/gitlab-org/security-products/sast-rules
- **上游提交**：`53bf5cf6df3c51b6c02110f5a638b5e6213666cd`
- **许可证**：MIT Expat
- **版权**：Copyright (c) 2011-present GitLab Inc.
- **适用对象**：`rules/dolphin-core.yml` 中 `java/`、`python/`、`javascript/`
  三个目录下标注为 `MIT` 的 **135 条规则**
- **完整原文**：`THIRD_PARTY_LICENSES/gitlab-sast-rules-MIT.txt`

## 2. securego/gosec

- **来源**：https://github.com/securego/gosec （`LICENSE.txt`）
- **许可证**：Apache License 2.0
- **版权**：Copyright (c) gosec developers
- **适用对象**：`rules/dolphin-core.yml` 中 `go/` 目录下标注为 `Apache-2.0` 的 **26 条规则**
  （这 26 条经上述 GitLab SAST Rules 仓库的 `go/` 目录引入，原始许可方为 gosec）
- **完整原文**：`THIRD_PARTY_LICENSES/gitlab-sast-rules-gosec-Apache-2.0.txt`

## 3. dsh-code-scan

- **来源**：https://github.com/xiaohuang-zaianlian/dsh-code-scan
- **许可证**：MIT
- **版权**：Copyright (c) 2025 huang-2028
- **适用对象**：基础扫描模块（`dsh-code-scan/lib/scanner.js`，以及 `dolphin-core.js`
  中的扫描调度逻辑）
- **完整原文**：`THIRD_PARTY_LICENSES/dsh-code-scan-MIT.txt`

## 4. dsh-web / dsh-ssh

- **来源**：https://github.com/zhu1090093659/dsh-web （npm 包 `@linxin666/dsh-ssh`）
- **许可证**：Apache License 2.0
- **版权**：Copyright (c) dsh-web contributors
- **适用对象**：SSH 引擎（`dolphin-ssh-core.js`）
- **完整原文**：`THIRD_PARTY_LICENSES/dsh-web-Apache-2.0.txt`

---

## 规则集逐条溯源

`rules/dolphin-core.yml` 全部 **162 条**规则的逐条来源、目标许可证与目标 SHA-256，
记录在 `rules/dolphin-core.manifest.json`。

许可证构成：

| 来源 | 条数 | 许可证 |
|---|---|---|
| GitLab SAST Rules（`java/` `python/` `javascript/`） | 135 | MIT |
| securego/gosec（经 GitLab SAST Rules `go/`） | 26 | Apache-2.0 |
| 自研（`dolphin-self`） | 1 | MIT |
| **合计** | **162** | MIT 136 + Apache-2.0 26 |

## Apache-2.0 合规说明

对于上述以 Apache License 2.0 授权的部分，本项目：

- 保留原始版权、专利、商标与归属声明（见 `THIRD_PARTY_LICENSES/` 内各文件）；
- 在 `THIRD_PARTY_LICENSES/` 中随附完整许可证原文；
- 未使用上游商标，未以原作者名义背书；
- 对修改过的文件已在 `rules/dolphin-core.manifest.json` 中记录变更痕迹
  （`check_id` 前缀归一化、`metadata.license` 注入等）。
