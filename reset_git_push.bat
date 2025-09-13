@echo off
REM ===============================
REM 清理本地 Git 历史并强制推送到远程
REM ===============================

REM 远程仓库地址，请修改为你的仓库
SET REMOTE_URL=https://github.com/ChenZhu-Xie/xczphysics_SilverBullet.git

REM 分支名
SET BRANCH=main

echo 正在删除本地 .git 文件夹...
rmdir /s /q .git

echo 初始化新的 Git 仓库（默认分支 %BRANCH%）...
git init -b %BRANCH%

echo 添加远程仓库...
git remote add origin %REMOTE_URL%

echo 添加所有文件...
git add .

echo 提交文件...
git commit -m "Initial commit"

echo 推送到远程 %BRANCH% 分支（强制覆盖）...
git push origin %BRANCH% --force

echo 完成！
pause
