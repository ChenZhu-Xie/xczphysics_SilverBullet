

# Question I ask in Tana Slack

## Q1 嵌套搜索 Tana 和 LogSeq 做不到，SB 可以

### q1

***Nested Searches***:  

* Can the table output of one query builder (search node) be used as the input of another, similar to SQL’s `SELECT FROM`?
  * 确认了，不能。即使确实允许在 query 里构建 query，但最里面层的 query builder 不会被解析为 搜索表达式，而只会被解析出 node 名。
  - 像 logseq 一样，一般只能构建一个 query，里面用嵌套的逻辑。而不是多个 query 嵌套（一个查询输出表，作为另一个查询的检索表输入）。

***For example***,  

1. `URL: Set` yields nodes that contain a `Url` field.
2. `IS FIELD` then extracts the pure field nodes, discarding their parent nodes.

simply using `and` doesn't work: `(URL==Set) AND (is:Field)` . so nested searches needed.

#### A1

==A:== Return just field values is a bit tricky  
  
1. Easiest is just put it in table view and display in column the values you want
2. You can use a quirky query

> >Path: >URL: (empty value)

### q2 

> IS FIELD will return field references, not field values

tried and yes, shouldn't use IS FIELD in this case.

> Return just field values is a bit tricky

1. Easiest is just put it in table view and display in column the values you want
2. You can use a quirky query

> >Path: >URL: (empty value)

exactly, I want to query the pure values of  all the pasted links' URL fields as a single list.I've tried `>Path: >URL: (empty value)` , the first `[https://tanacommunity.slack.com](https://tanacommunity.slack.com/)` is as expected, but get some other results (not that pure):

raw links as pure texts like `[https://tanacommunity.slack.com](https://tanacommunity.slack.com/)` (whose father is a clickable link) as node refereces list is what i expect actually. （已编辑） 

rather than clickable links (as directly pasted)

#### A2

==A:== Add a line http or .com to the query

## Q2 无法 往下分屏

How can one open a new panel vertically (downward) rather than horizontally (to the right) in Tana?

#### A

==A:== Top / bottom panels have been deprecated

## Q3 Tana 和 LogSeq 的 attr 模板内无法感知外

[[PKM/Apps/Tana]] 在 field object - field type - options - ==Sources of options== 中

通过 >:Path 只能 **query build** 出 `schema` > `#Object of PKM app` > `Equivalents` > `Values` ，

其中
- PARENT = `Values` 
- GRANDPARENT = `Equivalents`

---
[[PKM/Apps/LogSeq]] 在 tag object - tag properties - property instance - ==(Default) value== 中，

通过 下述 `当前 node 所有祖先（不包含自身）`
```Clojure
{:query
    [:find (pull ?a [*])
     :in $ ?c %
     :where
     (ancestor ?c ?a)]

 :inputs
    [:current-block]

 :rules
    [[(ancestor ?c ?p)
      [?c :block/parent ?p]]

     [(ancestor ?c ?a)
      [?c :block/parent ?p]
      (ancestor ?p ?a)]]}
```

只能 **Query** 出 `property instance` 一个值... 
等价于 Tana 的 GRANDPARENT = `Equivalents`

---
==结论==：Tana 和 LogSeq 二者的 field templete 中的 query，在实例化后
没法 穿透 field 本身这个屏障，
以到达它 所属的 (`Owned by` in Tana) 实例化节点

### q1

I have two nodes, “itag” and “tag (base type)”, both tagged with `#"Object of PKM app"`.

From a query builder node named “equivalents” placed under either node, it is easy to retrieve the other node sharing this tag,  using query `(Tagged:Object of PKM app) AND (NOT (Node name==PARENT) )` (*where PARENT = “itag”*).

However, within the “equivalents” field of `#"Object of PKM app"` itself, it is impossible to query ***any node with the same tag other than the node itself***.

of no help EVEN using  `(Tagged:Object of PKM app) AND (NOT (Node name==GRANDPARENT) )` (*where GRANDPARENT can only trace up to "equivalents" field node, rather than the GRANDGRANDPARENT “itag” node*)

#### A1

==A:== Search nodes within field configurations are unable to dynamically adapt to instances

### q2

pic1: when "equivalents" node as the child of the node "tag (base type)", all go smooth  
pic2: when "equivalents" field as the field of the "tag (base type)", same query (as `source of options`) don't work

* PARENT then leads to "Values" rather than "tag (base type)" , and
* GRANDPARENT leads to "equivalents" rather than "tag (base type)"

so I suppose we need GRANDGRANDPARENT to make things happen again.

#### A2

==A:== It is not a GRAND^nPARENT issue, it is an instance adoption issue.

You can create a PARENT search node with a tag config template, then when you tag a node you can see the search within that instance adopts the PARENT of the instance. 

Even within the tag template you can see the linter says INSTANCE to designate this will be filled once instantiated.This ability is not present with field config / field instance so the field dropdowns are not adaptable. Workaround is to do the former and put a search within the tag template.No timeline on when this will be addressed

### q3

Get it, is it something like below?

i.e. using a search node named "equivalents" in Tag Template to replace the "equivalents" field whose value is templated as a search node?

==A:== 
