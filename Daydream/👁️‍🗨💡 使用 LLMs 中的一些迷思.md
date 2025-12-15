---
Title: Humans as the “Natural Selectors” of LLMs
Abstract: "Both the use and the training of LLM resembles a process of natural selection: preserving every advantageous variation it produces."
---
#LLMs #💡 

Some #reflections on the Use of #LLMs:

# 压缩后

## Humans as the “Natural Selectors” of LLMs

Both the use and the training of LLM resembles a process of natural selection: preserving every advantageous variation it produces. #abstract

1. Variation: LLM training (Dev) mutates parameters; LLM interaction (Use) mutates outputs.
2. Inheritance: successive weights (Dev) and outputs (Use) differ minimally; BPs and prompts mediate a → b as operators.
3. Selection: advantageous parameters (Dev) and codes (Use) persist.

炼金术 的 另一种 intepretation?

- [@xczphysics](https://mastodon.social/@xczphysics/115717288134607059) #mastodon #social

# 原文

## 人类 = LLM 的 “自然选择器”

人类用 AI 的过程像是：在保留它的每一次有利变异...不是么？

1.  **变异（variation）**：基因随机变一变
    - 训练 LLM，以及 使用 LLM
      - 每次训练 LLM 的权重，每次使用 LLM 的输出
      - 前者在朝着梯度下降的方向演变，后者在朝着用户期望的结果演变
2.  **遗传（inheritance）**：下一代继承上一代大部分特征。
    - 下一次 LLM 训练完成的权重分布，相对上一次训练，可能变得不多
    - 下一次 LLM 吃了上一次的输出后，吐出的代码，相对其输入，变得不多
      - 人类的 prompt 像是 a to b 中的 to 箭头 头顶的 operator 算子
3.  **选择（selection）**：环境偏好某些特征，这些特征在种群里越来越多。
    - 每次训练 LLM 后，新 LLM 相对于 旧 LLM，所遗留的优良性状及对应 Gene，被选择性保留
    - 每次使用 LLM 后，LLM 作用于旧代码后，生成的新代码中，表现优良的部分，及对应的 code，被选择性保留
