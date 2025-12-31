
# Field

## Key

PATH - [QTnCqDKJNQk](https://youtu.be/QTnCqDKJNQk?t=3474) #youtube

## Value

WITH REFS - [QTnCqDKJNQk](https://youtu.be/QTnCqDKJNQk?t=3547) #youtube

### 可以是另一个节点

- [QTnCqDKJNQk](https://youtu.be/QTnCqDKJNQk?t=3191) #youtube

#### 甚至包括 search node

[pinciple:一对多时，使用 search node 作为 key 的 value 值]
- [n1J0tZqb_6A](https://youtu.be/n1J0tZqb_6A?t=643) #youtube

#### field.obj's key ，可以拿到 obj's field 值 

1. [n1J0tZqb_6A](https://youtu.be/n1J0tZqb_6A?t=1274) #youtube

##### 甚至 无限地 dot 下去，穿透式寻找。 但不能反向上寻找...

1. [n1J0tZqb_6A](https://youtu.be/n1J0tZqb_6A?t=1321) #youtube

![[PKM/Apps/Tana/2025-12-31_03-01-30.png]]

# 对 field 求值：以构建 关系图中的 边
串联 `value = ${key}` 以构建 标题：[n1J0tZqb_6A](https://youtu.be/n1J0tZqb_6A?t=357) #youtube
#类似 `string.format` [n1J0tZqb_6A](https://youtu.be/n1J0tZqb_6A?t=1221) #youtube
see also [n1J0tZqb_6A](https://youtu.be/n1J0tZqb_6A?t=1246) #youtube and [n1J0tZqb_6A](https://youtu.be/n1J0tZqb_6A?t=1259) #youtube

#关系型数据库

Doc: [https://silverbullet.md/](https://silverbullet.md/)
Community: [https://community.silverbullet.md/latest](https://community.silverbullet.md/latest)
Source Code: [https://github.com/silverbulletmd/silverbullet](https://github.com/silverbulletmd/silverbullet)

> ${name} official doc URL in markdown with concise name
> the ${name} Community URL as markdown, keep it clean

## Slack 上对 双向 field 的讨论，
[p1766960701835609](https://tanacommunity.slack.com/archives/C02DAKDSVQA/p1766960701835609) #tanacommunity #slack
引出了该 youtube video ==n1J0tZqb_6A== #学术.
- [[双向 field]] #类似
  - [[2. Discoveries Along the Way/💡🧠 OB 插件 BreadCrumb|]] 中的 key:value 中，value 的 逆/反关系 和 反箭头
  - Tana 中通过 [[PKM/Apps/Tana/🔎 Search Node]] 来自动化这种 逆？

==Q:== Is there a way to two-way link the values of a field in different objects? What I'm trying to do is create a network of my contacts and using a field to set the people each person knows, but I want to define a value in one place and it be reflected in the other person's field, i.e.: John Doe.Relations has Anne Joe as the value, and once I enter AnneJoe the Relations field should have John Doe already in place. I'm coming from Capacities and they have [this feature](https://capacities.io/whats-new/release-50), and I'm trying to map that concept into how Tana works  

有没有办法将不同对象中某个字段的值双向关联起来？我想要创建一个联系人网络，并使用一个字段来设置每个人认识的人。我希望在一个地方定义一个值，它能够反映在另一个人的字段中，例如：John Doe.Relations 字段的值为 Anne Joe，当我输入 AnneJoe 后，Relations 字段的值应该自动更新为 John Doe。我之前使用过 Capacities，它有[这个功能](https://capacities.io/whats-new/release-50) ，现在我想把这个概念应用到 Tana 中。

==A:== No two way field in Tana, have to do a field and a search and perhaps some intermediate layer  
Tana 中没有双向字段，必须先进行字段操作，然后进行搜索，可能还需要一些中间层。

I detail this and potential solutions in the live build session here: [https://tana.inc/articles/tana-live-build-clarifying-complex-connections](https://tana.inc/articles/tana-live-build-clarifying-complex-connections)  
我在本次在线构建会议中详细介绍了这个问题以及可能的解决方案：https://tana.inc/articles/tana-live-build-clarifying-complex-connections

TLDR make a separate tag #Relation with fields for each person and make search node in #person template that shows their #relations  
简而言之，为每个人创建一个单独的 #Relation 标签，并添加相应的字段，然后在 #person 模板中创建一个搜索节点，用于显示他们的 #relations 关系。



