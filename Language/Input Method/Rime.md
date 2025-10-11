

https://aituyaa.com/%E4%B8%80%E6%AC%BE%E5%BD%A2%E7%A0%81%E5%8F%AF%E7%94%A8%E7%9A%84%E8%BE%85%E5%8A%A9%E9%80%89%E9%87%8D%E6%8F%92%E4%BB%B6/

# PC 端

## 输入法部署
```powershell
git clone --depth 1 https://github.com/rimeinn/rime-JDhe Rime_data
```
→ 输入法设定（多选方案） → 重新部署

## 方案选择
F4 或 ctrl + ~ 单选方案


# IOS 端

https://ihsiao.com/apps/hamster/docs/guides/sync/
## 
## icloud
   本来这是对 IOS 端最好的。
   但我没有选择 icloud 方案。
   因为...需要 MStore 安装，且强制安装到 C 盘。

## Rime 自带同步
   似乎只能同步码表/词库也就是 .db，不能同步输入方案/配置文件
   见 https://ihsiao.com/apps/hamster/docs/guides/sync/

## Wifi 或者 有线
   都是对 IOS app 本地数据文件夹 进行 or 覆盖 
   
1. PC 与 IOS 在同一 wifi 下
2. PC 登陆 http://192.168.1.5/
3. PC 删除 Rime 文件夹
4. PC 上传 Rime_data 进：原 Rime 所在 dir
   - 2 个 User.db 上传失败，不用关心。
   - 见 https://ihsiao.com/apps/hamster/docs/guides/sync/
6. IOS 改名 Rime_data 为 Rime
7. IOS 重新部署