---
githubUrl: "https://github.com/silverbulletmd/silverbullet-libraries/blob/main/Git.md"
---
#meta

This library adds a basic git synchronization functionality to SilverBullet. It should be considered a successor to [silverbullet-git](https://github.com/silverbulletmd/silverbullet-git) implemented in Space Lua.

The following commands are implemented:

${widgets.commandButton("Git: Sync")}

* Adds all files in your folder to git
* Commits them with the default "Snapshot" commit message
* `git pull`s changes from the remote server
* `git push`es changes to the remote server

${widgets.commandButton("Git: Commit")}

* Asks you for a commit message
* Commits

# Configuration
There is currently only a single configuration option: `git.autoSync`. When set, the `Git: Sync` command will be run every _x_ minutes.

Example configuration:
```lua
config.set("git.autoSync", 5)
```

# Implementation
The full implementation of this integration follows.

## Configuration
```space-lua
-- priority: 100
config.define("git", {
  type = "object",
  properties = {
    autoSync = schema.number()
  }
})
```

## Commands
```space-lua
-- Create a more robust global git lock
if not _G then
  -- Fallback if _G is not available
  gitLock = {
    isLocked = false,
    currentOperation = ""
  }
  
  acquireGitLock = function(operationName)
    if gitLock.isLocked then
      editor.flashNotification("Git operation '" .. gitLock.currentOperation .. "' is already running. Please wait.", "warning")
      return false
    end
    
    gitLock.isLocked = true
    gitLock.currentOperation = operationName
    return true
  end
  
  releaseGitLock = function()
    gitLock.isLocked = false
    gitLock.currentOperation = ""
  end
else
  -- Use _G if available
  _G.gitLock = {
    isLocked = false,
    currentOperation = ""
  }
  
  _G.acquireGitLock = function(operationName)
    if _G.gitLock.isLocked then
      editor.flashNotification("Git operation '" .. _G.gitLock.currentOperation .. "' is already running. Please wait.", "warning")
      return false
    end
    
    _G.gitLock.isLocked = true
    _G.gitLock.currentOperation = operationName
    return true
  end
  
  _G.releaseGitLock = function()
    _G.gitLock.isLocked = false
    _G.gitLock.currentOperation = ""
  end
  
  -- Also create local references for consistency
  gitLock = _G.gitLock
  acquireGitLock = _G.acquireGitLock
  releaseGitLock = _G.releaseGitLock
end

git = {}

function git.commit(message, showSteps, isColdStart)
  message = message or "Snapshot"
  showSteps = showSteps == nil and true or showSteps
  
  if showSteps then
    print("Committing...")
    if isColdStart == nil then
      editor.flashNotification("Committing local changes...", "info")
    else
      editor.flashNotification("Step 1/3: Committing local changes...", "info")
    end
  end
  
  local addOk, addResult = pcall(function() return shell.run("git", {"add", "./*"}) end)
  if not addOk then
    return false, "Git add failed: " .. tostring(addResult)
  end
  
  local commitOk, commitResult = pcall(function() return shell.run("git", {"commit", "-a", "-m", message}) end)
  if not commitOk then
    local errorMessage = tostring(commitResult)
    if not errorMessage:find("nothing to commit") then
      return false, "Git commit failed: " .. errorMessage
    else
      return "nothing", "Nothing to commit: working tree is clean."
    end
  end
  
  local commitOutput = commitResult.stdout or ""
  local commitError = commitResult or ""
  
  if commitResult.code == 0 then
    return true, "Commit successful!"
  elseif commitOutput:find("nothing to commit") or commitError:find("nothing to commit") then
    return "nothing", "Nothing to commit: working tree is clean."
  else
    return false, "Git commit failed: " .. (commitError or "Unknown error")
  end
end

function git.sync(showSteps, isColdStart)
  showSteps = showSteps == nil and true or showSteps
  
  local commitOk, commitMessage = git.commit(nil, showSteps, isColdStart)
  if commitOk == false then
    return false, commitMessage
  elseif commitOk == "nothing" then
      editor.flashNotification("No changes to commit", "info")
  end

  if showSteps then
    print("Pulling...")
    editor.flashNotification("Step 2/3: Pulling from remote...", "info")
  end
  
  local pullOk, pullResult = pcall(function() return shell.run("git", {"pull"}) end)
  if not pullOk then
    return false, "Git pull failed: " .. tostring(pullResult)
  end

  if showSteps then
    print("Pushing...")
    editor.flashNotification("Step 3/3: Pushing to remote...", "info")
  end

  local pushOk, pushResult = pcall(function() return shell.run("git", {"push"}) end)
  if not pushOk then
    if not isColdStart then
      return false, "Git push failed: " .. tostring(pushResult)
    else
      local syncResultMessage = "Only push failed"
      editor.flashNotification(syncResultMessage .. ": remote is read only", "info")
      return true, syncResultMessage
    end
  end

  local syncResultMessage = "Git sync successful."
  return true, syncResultMessage
end

command.define {
  name = "Git: Commit",
  run = function()
    if not acquireGitLock("Git: Commit") then
      return
    end

    local message = editor.prompt("Commit message:")
    if not message then 
      releaseGitLock()
      return 
    end
    
    local commitOk, commitMessage = git.commit(message, true, nil)
    
    if commitOk == false then
      editor.flashNotification(commitMessage, "error")
    else
      editor.flashNotification(commitMessage, "info")
    end
    
    releaseGitLock()
  end
}

command.define {
  name = "Git: Sync",
  run = function()
    if not acquireGitLock("Git: Sync") then
      return
    end

    editor.flashNotification("Starting manual Git sync...", "info")
    
    local syncOk, syncMessage = git.sync(true, false)
    
    if syncOk then
      editor.flashNotification("Manual Git sync complete! ", "info")
    else
      editor.flashNotification(syncMessage, "error")
    end

    releaseGitLock()
  end
}

command.define {
  name = "Git: Force Push Initial Commit",
  run = function()
    if not editor.confirm("DANGER: This will WIPE your entire Git history (local and remote) and start over. Are you absolutely sure?") then
      return
    end

    if not acquireGitLock("Git: Force Push Initial Commit") then
      return
    end
    
    editor.flashNotification("Starting force push process...", "info")

    editor.flashNotification("Step 1/6: Reading remote URL...", "info")
    local getUrlOk, remoteUrlResult = pcall(function() 
      return shell.run("git", {"remote", "get-url", "origin"}) 
    end)
    
    local remoteUrl = ""
    
    if not getUrlOk or not remoteUrlResult or not remoteUrlResult.stdout or remoteUrlResult.stdout == "" then
      editor.flashNotification("No remote URL found. Please enter the remote repository URL.", "warning")
      
      remoteUrl = editor.prompt("Enter remote repository URL:")
      
      if not remoteUrl or remoteUrl == "" then
        editor.flashNotification("Force push cancelled: no remote URL provided.", "info")
        releaseGitLock()
        return
      end
    else
      remoteUrl = remoteUrlResult.stdout:gsub("%s+", "")
    end
    
    editor.flashNotification("Remote URL: " .. remoteUrl, "info")

    editor.flashNotification("Step 2/6: Wiping local history...", "info")
    
    local detectedOS = "Unknown"
    local deleteSuccess = false
    
    local winOk, winResult = pcall(function() 
      return shell.run("cmd", {"/c", "rd", "/s", "/q", ".git"})
    end)
    
    if winOk and winResult and winResult.code == 0 then
      detectedOS = "Windows"
      deleteSuccess = true
    end
    
    local linuxOk, linuxResult = pcall(function() 
      return shell.run("rm", {"-rf", ".git"})
    end)
    
    if linuxOk and linuxResult and linuxResult.code == 0 then
      detectedOS = "Unix/Linux"
      deleteSuccess = true
    end
    
    if deleteSuccess then
      --editor.flashNotification("Detected OS: " .. detectedOS, "info")
      editor.flashNotification(".git directory removed successfully!", "info")
    else
      --editor.flashNotification("Failed to delete .git directory on both Windows and Unix/Linux systems.", "error")
      editor.flashNotification("Failed to delete .git directory.", "error")
      releaseGitLock()
      return
    end

    editor.flashNotification("Step 3/6: Re-initializing repository on 'main' branch...", "info")
    local initOk, initResult = pcall(function() 
      return shell.run("git", {"init", "-b", "main"}) 
    end)
    
    if not initOk then
      editor.flashNotification("Error: Failed to re-initialize git - " .. tostring(initResult), "error")
      releaseGitLock()
      return
    end
    
    if initResult.code ~= 0 then
      editor.flashNotification("Error: Git initialization failed - " .. (initResult or "Unknown error"), "error")
      releaseGitLock()
      return
    end

    editor.flashNotification("Step 4/6: Re-linking to remote...", "info")
    local remoteAddOk, remoteAddResult = pcall(function() 
      return shell.run("git", {"remote", "add", "origin", remoteUrl}) 
    end)
    
    if not remoteAddOk then
      editor.flashNotification("Error: Failed to re-add remote origin - " .. tostring(remoteAddResult), "error")
      releaseGitLock()
      return
    end
    
    if remoteAddResult.code ~= 0 then
      editor.flashNotification("Error: Adding remote failed - " .. (remoteAddResult or "Unknown error"), "error")
      releaseGitLock()
      return
    end
    
    editor.flashNotification("Step 5/6: Creating initial commit...", "info")
    local commitOk, commitMessage = git.commit("Initial Commit", false, false)
    if commitOk ~= true then
      editor.flashNotification("Error during initial commit: " .. commitMessage, "error")
      releaseGitLock()
      return
    end

    editor.flashNotification("Step 6/6: Force pushing to remote...", "info")
    local pushOk, pushResult = pcall(function() 
      return shell.run("git", {"push", "--force", "origin", "main"}) 
    end)
    
    if not pushOk then
      editor.flashNotification("Git force push failed: " .. tostring(pushResult), "error")
      releaseGitLock()
      return
    end
    
    if pushResult.code ~= 0 then
      local errorMsg = pushResult or "Unknown error"
      editor.flashNotification("Git force push failed: " .. errorMsg, "error")
      releaseGitLock()
      return
    end
    
    editor.flashNotification("Force push initial commit successful on " .. detectedOS .. "!", "info")
    releaseGitLock()
  end
}

command.define {
  name = "Git: Force Pull to Overwrite Local",
  run = function()
    if not editor.confirm("DANGER: This will DISCARD all local changes and commits, making your local copy identical to the remote. Are you sure?") then
      return
    end

    if not acquireGitLock("Git: Force Pull to Overwrite Local") then
      return
    end
    
    editor.flashNotification("Starting force pull process...", "info")
    
    editor.flashNotification("Step 1/3: Fetching from remote...", "info")
    local fetchOk, fetchResult = pcall(function() return shell.run("git", {"fetch", "origin"}) end)
    if not fetchOk then
      editor.flashNotification("Git fetch failed: " .. tostring(fetchResult), "error")
      releaseGitLock()
      return
    end
    
    editor.flashNotification("Step 2/3: Resetting local to match remote...", "info")
    local resetOk, resetResult = pcall(function() return shell.run("git", {"reset", "--hard", "origin/main"}) end)
    if not resetOk then
      editor.flashNotification("Git reset --hard failed: " .. tostring(resetResult), "error")
      releaseGitLock()
      return
    end
    
    editor.flashNotification("Step 3/3: Cleaning untracked files...", "info")
    local cleanOk, cleanResult = pcall(function() return shell.run("git", {"clean", "-fd"}) end)
    if not cleanOk then
      editor.flashNotification("Git clean failed: " .. tostring(cleanResult), "error")
      releaseGitLock()
      return
    end

    editor.flashNotification("Force pull successful! Local is now identical to remote.", "info")
    releaseGitLock()
  end
}
```

```space-lua
-- priority: -1

local periodicSyncMinutes = config.get("git.autoSync")
if periodicSyncMinutes then
  print("Enabling periodic git auto sync every " .. periodicSyncMinutes .. " minutes")
end

local eventSyncDelaySeconds = 60
local eventSyncScheduledAt = 0

event.listen {
  name = "page:saved",
  run = function(event)
    local lockObj = _G and _G.gitLock or gitLock
    if lockObj and lockObj.isLocked then
      print("Sync in progress, ignoring this 'page:saved' event for page: " .. event.name)
      return
    end
    print("Page '" .. event.name .. "' saved. Scheduling git sync in " .. eventSyncDelaySeconds/60 .. " minutes.")
    eventSyncScheduledAt = os.time()
  end
}
print("Event-driven git sync enabled (on page save).")

local lastPeriodicSync = 0
local coldStartSyncTriggered = false
local startupTime = os.time()

local function performAutoSync(syncType)
  local lockObj = _G and _G.gitLock or gitLock
  local acquireFn = _G and _G.acquireGitLock or acquireGitLock
  local releaseFn = _G and _G.releaseGitLock or releaseGitLock
  
  if not acquireFn("Automatic Sync") then
    return
  end
  
  print("Triggering " .. syncType:lower() .. " git sync...")
  editor.flashNotification("Triggering " .. syncType .. " Git sync...", "info")
  
  if not git or not git.sync then
    print("ERROR: git.sync not available")
    releaseFn()
    return
  end

  local isColdStart = (syncType == "Startup")
  local syncOk, syncMessage = git.sync(true, isColdStart)
  
  if syncOk then
    if isColdStart and syncMessage == "Only push failed" then
      editor.flashNotification(syncType .. ": Git pull complete.", "info")
    else
      editor.flashNotification(syncType .. ": Git sync complete.", "info")
    end
    print(syncType .. " sync completed successfully")
  else
    editor.flashNotification(syncMessage, "error")
    print(syncType .. " sync failed:", syncMessage)
  end

  releaseFn()
end  

event.listen {
  name = "cron:secondPassed",
  run = function()
    local lockObj = _G and _G.gitLock or gitLock
    local acquireFn = _G and _G.acquireGitLock or acquireGitLock
    local releaseFn = _G and _G.releaseGitLock or releaseGitLock
    
    if not lockObj or not acquireFn or not releaseFn then
      return
    end
    
    if lockObj.isLocked then
      return
    end

    local now = os.time()
    local uptime = now - startupTime
    local shouldSync = nil

    if periodicSyncMinutes and not coldStartSyncTriggered and uptime >= 5 and uptime <= 10 then
      shouldSync = "cold-start"
      coldStartSyncTriggered = true
      print("=== Cold Start Sync Triggered ===")
      print("Uptime:", uptime, "seconds")
    elseif periodicSyncMinutes and coldStartSyncTriggered and (now - lastPeriodicSync) / 60 >= periodicSyncMinutes then
      shouldSync = "periodic"
    elseif eventSyncScheduledAt > 0 and (now - eventSyncScheduledAt) >= eventSyncDelaySeconds then
      shouldSync = "event-driven"
    end

    if shouldSync then
      if shouldSync == "cold-start" then
        lastPeriodicSync = now
        eventSyncScheduledAt = 0
        performAutoSync("Startup")
      elseif shouldSync == "periodic" then
        lastPeriodicSync = now
        eventSyncScheduledAt = 0
        performAutoSync("Periodic")
      else
        eventSyncScheduledAt = 0
        lastPeriodicSync = now
        performAutoSync("Event-driven")
      end
    end
  end
}
```