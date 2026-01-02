

# Question I ask in Tana Slack

## 1

***Nested Searches***:  

* Can the table output of one query builder (search node) be used as the input of another, similar to SQL’s `SELECT FROM`?

***For example***,  

1. `URL: Set` yields nodes that contain a `Url` field.
2. `IS FIELD` then extracts the pure field nodes, discarding their parent nodes.

simply using `and` doesn't work: `(URL==Set) AND (is:Field)` . so nested searches needed.

==A:== Add a line http or .com to the query

## 2

How can one open a new panel vertically (downward) rather than horizontally (to the right) in Tana?

==A:== Top / bottom panels have been deprecated

## 3

I have two nodes, “itag” and “tag (base type)”, both tagged with `#"Object of PKM app"`.

From a query builder node named “equivalents” placed under either node, it is easy to retrieve the other node sharing this tag,  using query `(Tagged:Object of PKM app) AND (NOT (Node name==PARENT) )` (*where PARENT = “itag”*).

However, within the “equivalents” field of `#"Object of PKM app"` itself, it is impossible to query ***any node with the same tag other than the node itself***.

of no help EVEN using  `(Tagged:Object of PKM app) AND (NOT (Node name==GRANDPARENT) )` (*where GRANDPARENT can only trace up to "equivalents" field node, rather than the GRANDGRANDPARENT “itag” node*)

==A:== Search nodes within field configurations are unable to dynamically adapt to instances
