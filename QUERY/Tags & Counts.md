
1. [converting v1 query to v2](https://community.silverbullet.md/t/converting-v1-query-to-v2/3615/3?u=chenzhu-xie) #community #silverbullet

`${template.each( (function()
  local tb = query[[from index.tag "tag" order by _.name]]
  local counts = {}
  local counted = {}
  for _, it in ipairs(tb) do
      if counts[it.name] then counts[it.name] = counts[it.name] + 1
      else counts[it.name] = 1 end
  end
  for k, obj in pairs(counts) do
      table.insert(counted, {name = k, count = obj})
  end
  return counted
end)(), 
function(obj)
  return spacelua.interpolate([==[
 [[tag:${name}|#${name}]] (${count})
]==], obj)
end)}`

2. related: [[STYLE/Widget/Tag-Page_Navigator]]
