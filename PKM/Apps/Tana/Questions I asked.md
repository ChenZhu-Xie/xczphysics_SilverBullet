

# Question I ask in Tana Slack

## Q1

### Q1

***Nested Searches***:  

* Can the table output of one query builder (search node) be used as the input of another, similar to SQL’s `SELECT FROM`?

***For example***,  

1. `URL: Set` yields nodes that contain a `Url` field.
2. `IS FIELD` then extracts the pure field nodes, discarding their parent nodes.

simply using `and` doesn't work: `(URL==Set) AND (is:Field)` . so nested searches needed.

#### A1

==A:== Return just field values is a bit tricky  
  

1. Easiest is just put it in table view and display in column the values you want
2. You can use a quirky query

> >Path: >URL: (empty value)

### Q2

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

## Q2

How can one open a new panel vertically (downward) rather than horizontally (to the right) in Tana?

#### A

==A:== Top / bottom panels have been deprecated

## Q3

### Q1

I have two nodes, “itag” and “tag (base type)”, both tagged with `#"Object of PKM app"`.

From a query builder node named “equivalents” placed under either node, it is easy to retrieve the other node sharing this tag,  using query `(Tagged:Object of PKM app) AND (NOT (Node name==PARENT) )` (*where PARENT = “itag”*).

However, within the “equivalents” field of `#"Object of PKM app"` itself, it is impossible to query ***any node with the same tag other than the node itself***.

of no help EVEN using  `(Tagged:Object of PKM app) AND (NOT (Node name==GRANDPARENT) )` (*where GRANDPARENT can only trace up to "equivalents" field node, rather than the GRANDGRANDPARENT “itag” node*)

### Q2

pic1: when "equivalents" node as the child of the node "tag (base type)", all go smooth  
pic2: when "equivalents" field as the field of the "tag (base type)", same query (as `source of options`) don't work

* PARENT then leads to "Values" rather than "tag (base type)" , and
* GRANDPARENT leads to "equivalents" rather than "tag (base type)"

so I suppose we need GRANDGRANDPARENT to make things happen again.

#### A

==A:== Search nodes within field configurations are unable to dynamically adapt to instances
