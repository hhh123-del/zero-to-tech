---
title: 强化学习
description: MC、SGD、Sarsa、Q-learning、DQN、actor-critic
order: 4
---

# 4.1 强化学习基本概念

## 核心思想：从“试错”中学习
与监督学习（有标准答案）不同，强化学习（RL）没有直接告诉智能体该怎么做。智能体必须通过在**环境（Environment）**中不断**试错（Trial and Error）**，根据环境反馈的**奖励（Reward）**，调整自己的**动作（Action）**，最终学习到实现目标的最优策略。

---

##  一、核心要素 (MDP 的五大基石)

强化学习的标准数学模型是 **马尔可夫决策过程（Markov Decision Process, MDP）**，包含以下 5 个核心要素：

1.  **Agent（智能体）**：做出决策的主体（如机器人、下棋的 AI）。
2.  **Environment（环境）**：智能体所处的外部世界，会对智能体的动作做出反应。
3.  **State（状态 \(S\)）**：智能体在当前时刻对环境的感知。
    *   **State space（状态空间）**：所有可能状态的集合，\(S = \{s_1, s_2, \dots\}\)。
4.  **Action（动作 \(A\)）**：智能体可以采取的行为。
    *   **Action space（动作空间）**：在当前状态下所有可行动作的集合，\(A(s) = \{a_1, a_2, \dots\}\)。
5.  **Reward（奖励 \(R\)）**：环境在智能体执行动作后给予的反馈（可以是正分或负分）。它是智能体学习的方向标。

---

## 二、 核心动态过程概念

### 1. State Transition
*   **定义**：智能体在状态 \(s\) 采取动作 \(a\) 后，环境转移到下一个状态 \(s'\) 的过程。
*   **概率表示**：\(p(s'|s, a)\)。表示在 \(s\) 采取 \(a\) 后，到达 \(s'\) 的概率。
*   *注：如果环境存在随机性（如冰面打滑），转移就是概率性的；如果完全确定，概率就是 1 或 0。*

### 2. Policy
*   **定义**：智能体在每个状态下选择动作的规则。策略是强化学习最终要寻找的答案。
*   **数学表示**：\(\pi(a|s)\)。表示在状态 \(s\) 下，选择动作 \(a\) 的概率。
    *   确定性策略：\(\pi(a|s) = 1\) 或 \(0\)。
    *   随机性策略：以一定概率分布选择动作（利于探索）。

### 3. Trajectory
*   **定义**：智能体与环境交互产生的一连串“状态-动作-奖励”记录。
*   **表示**：\(S_0 \xrightarrow{a_0} S_1 \xrightarrow{r_1} S_2 \xrightarrow{a_1} S_3 \dots\)

### 4. Episode
*   **定义**：从初始状态开始，直到达到某个终止状态（Terminal State，如游戏通关或死亡）的完整过程。一个 Episode 包含了一条完整的轨迹。
*   *注：有的任务有终点（Episodic tasks），有的任务永远没有终点（Continuing tasks）。*

---

## 三、 优化目标：Return 与 Discount

强化学习的目标不是追求眼前的最大奖励，而是追求长远的**总回报**。

### 1. Return
从当前时刻 \(t\) 开始，未来所有奖励的总和。注意，它针对的是一条轨迹上的**特定状态**。
\[
 G_t = R_{t+1} + R_{t+2} + R_{t+3} + \dots 
\]

### 2. Discounted Return
为了体现“未来的奖励不如眼前的奖励香”以及防止无限循环任务奖励发散，引入折扣率 \(\gamma\)。
\[
 G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \dots = \sum_{k=0}^{\infty} \gamma^k R_{t+k+1} 
\]

*   **Discount Rate（折扣率 \(\gamma \in [0, 1)\)）**：
    *   当 \(\gamma \to 0\)：**近视眼**，只在乎眼前利益。
    *   当 \(\gamma \to 1\)：**远视眼**，更在乎长远利益。

---

## 四、 核心性质：马尔可夫性质 

这是 MDP 能够成立的最基本假设：**未来的状态只与当前状态有关，与过去的历史无关。**
用一句话概括：**“现在包含了所有决定未来的信息。”**

*   **数学表达**：\(p(S_{t+1} | S_t, A_t, S_{t-1}, A_{t-1}, \dots) = p(S_{t+1} | S_t, A_t)\)
*   **直观理解**：下棋时，当前的棋盘局势（当前状态）已经包含了所有信息，你不需要知道前面几步是怎么走的，也能决定下一步怎么下。

---

# 4.2 贝尔曼公式 

## 核心思想：递归与“套娃”
贝尔曼公式是强化学习最核心的数学基础。它的本质是**递归**：当前状态的价值，等于**眼前的即时奖励**加上**打折后的未来状态价值**。
*(注：本章的大前提是**基于模型（Model-based）**，即已知环境的转移概率 \(p\) 和奖励 \(r\)。)*

---

## 一、 核心概念：状态价值与动作价值

为了评估一个策略 \(\pi\) 的好坏，我们需要定义两个关键概念：

1.  **状态价值 (State Value, \(V_\pi(s)\))**
    *   **定义**：从状态 \(s\) 出发，**完全遵照**当前策略 \(\pi\) 行动，未来能获得的折扣回报的**期望值**。
    *   **公式**：\(V_\pi(s) = \mathbb{E}_\pi[G_t | S_t = s]\)

2.  **动作价值 (Action Value, \(q_\pi(s,a)\))**
    *   **定义**：在状态 \(s\) 下，**强制指定**当前动作 \(a\)，而**后续状态依然严格服从**策略 \(\pi\) 行动，未来能获得的折扣回报的**期望值**。
    *   **公式**：\(q_\pi(s,a) = \mathbb{E}_\pi[G_t | S_t = s, A_t = a]\)

---

## 二、 贝尔曼期望公式推导

\(V\) 和 \(q\) 是相互依赖的，我们可以通过两步推导出贝尔曼期望公式：

### 1. \(V\) 的表达式
当前状态的价值，等于按照策略 \(\pi\) 选各个动作的期望：
\[
 V_\pi(s) = \sum_a \pi(a|s) q_\pi(s,a) 
\]

### 2. \(q\)的表达式
动作的价值，等于采取该动作后获得的即时奖励期望，加上打折后的下一个状态价值的期望：
\[
 q_\pi(s,a) = \sum_{r} p(r|s, a)r + \gamma \sum_{s'} p(s'|s, a) V_\pi(s') 
\]

### 3. 贝尔曼期望公式
将 \(q\) 代入 \(V\)，得到：
\[
 V_\pi(s) = \sum_a \pi(a|s)  \left[\sum_{r} p(r|s, a)r + \gamma \sum_{s'} p(s'|s, a) V_\pi(s') \right] 
\]

**严谨的已知 vs 未知（针对状态价值 \(V\)）：**
*   🟢 **已知量**：
    *   \(\pi(a|s)\)：策略。
    *   \(p(s'|s, a)\) \(p(r|s, a)\)：环境转移概率（上帝视角）。
    *   \(r\)：真实奖励。
    *   \(\gamma\)：折扣率。
*   🔴 **未知量**：
    *   \(V_\pi(s)\) 和 \(V_\pi(s')\)。（等式两边都有未知数，构成了庞大的线性方程组）。

---

## 三、 矩阵与向量形式 

对于包含 \(N\) 个状态的空间，逐个写公式太麻烦。我们可以将所有状态的公式写成矩阵形式：

### 1. 方程的矩阵表达
\[
 V_\pi = R_\pi + \gamma P_\pi V_\pi 
\]
*   \(V_\pi\)：所有状态价值的列向量（大小为 \(N \times 1\)）。
*   \(R_\pi\)：所有状态即时奖励期望的列向量（大小为 \(N \times 1\)）。
*   \(P_\pi\)：状态转移矩阵（大小为 \(N \times N\)）。

### 2. 两种求解方法
*   **解析解（直接求逆矩阵）**：
    \[
 V_\pi = (I - \gamma P_\pi)^{-1} R_\pi 
\]
    *(注：状态空间极大时，求逆矩阵的计算复杂度极高，通常不用)。*
*   **迭代解（实际应用）**：
    \[
 V_{k+1} = R_\pi + \gamma P_\pi V_k 
\]
    *(利用压缩映射原理，不断套娃迭代，直到 \(V\) 收敛)。*

---

# 4.3 贝尔曼最优公式 

## 核心思想：从“评估”到“寻优”
第二章的贝尔曼期望公式是在**评估**一个给定的死板策略 \(\pi\) 有多好。
第三章则要**寻找**最好的那个策略 \(\pi^*\)。为了找最优，我们不再根据策略的概率 \(\pi(a|s)\) 去求期望（\(\sum\)），而是直接用 \(\max\) 选出最好的动作。

---

## 一、 核心概念：最优价值与最优策略

1.  **最优状态价值 (\(V^*(s)\))**
    *   **定义**：在所有可能的策略中，从状态 \(s\) 出发能获得的最大状态价值。
    *   **关系**：对于任意策略 \(\pi\)，都有 \(V^*(s) \ge V_\pi(s)\)。

2.  **最优策略 (\(\pi^*\))**
    *   **定义**：能使得所有状态价值都达到最大的策略。
    *   **贪婪策略（Greedy Policy）**：一旦解出了最优动作价值 \(q^*(s,a)\)，最优策略就是直接选择那个让 \(q\) 最大的动作：
        \[
 \pi^*(a|s) = \begin{cases} 1, & a = \arg\max_a q^*(s,a) \\ 0, & \text{其他} \end{cases} 
\]

---

## 二、 贝尔曼最优公式 

**公式演化**：把第二章贝尔曼期望公式里的 \(\sum_a \pi(a|s)\) 直接替换为 \(\max_a\)。

### 1. 最优公式
\[
 V^*(s) = \max_a \left[\sum_{r} p(r|s, a)r + \gamma \sum_{s'} p(s'|s, a) V^*(s') \right] 
\]

*   **直观理解**：当前状态的最优价值 = 选一个最好的动作 \(\max_a\)，该动作能带来的（即时奖励期望 + 折扣后下个状态的最优价值期望）。

**严谨的 已知 vs 未知（针对状态价值 \(V^*\)）：**
*   🟢 **已知量**：\(p(s', r|s, a)\)（环境转移概率）、\(r\)（真实奖励）、\(\gamma\)（折扣率）。
    *   *(注意：这里不需要策略 \(\pi\) 了，因为它隐含在 \(\max\) 里了)*。
*   🔴 **未知量**：\(V^*(s)\) 和 \(V^*(s')\)。（等式两边都有未知数，是一个非线性方程组）。

### 2. 矩阵与向量形式
\[
 V = \max_\pi (R_\pi + \gamma P_\pi V) 
\]
*(注意：这里的 \(\max_\pi\) 是**逐元素的最大值**，意思是对于每一个状态 \(s\)，都挑一个能让右边式子最大的策略，而不是矩阵求逆。)*

---

## 三、 压缩映射定理与求解 

贝尔曼最优公式（BOE）是非线性的（因为有 \(\max\)），不能像第二章那样直接求逆矩阵。但数学家证明了它有唯一解，且可以通过迭代求解。

### 1. 压缩映射定理
将 BOE 右侧定义为一个算子 \(f(V)\)：\(f(V) = \max_\pi (R_\pi + \gamma P_\pi V)\)。
*   定理：\(f(V)\) 是一个**压缩映射**（因为 \(\gamma \in [0, 1)\)），满足：
    \[
 \|f(V_1) - f(V_2)\|_\infty \le \gamma \|V_1 - V_2\|_\infty 
\]
*   **三大结论**：
    1.  **存在性**：最优价值 \(V^*\) 一定存在。
    2.  **唯一性**：\(V^*\) 是唯一的。
    3.  **收敛性**：不管初始值 \(V_0\) 是什么，通过迭代公式 \(V_{k+1} = f(V_k)\)，最终必定收敛到 \(V^*\)。

### 2. 迭代求解法 
\[
 V_{k+1}(s) = \max_a \left[\sum_{r} p(r|s, a)r + \gamma \sum_{s'} p(s'|s, a) V_k(s') \right] 
\]

不断套娃，直到 \(V\) 收敛。

---

## 四、 最优策略的性质与影响因素

1.  **什么因素决定了最优策略 \(\pi^*\)？**
    *   ① 奖励设计 (Reward design, \(r\))
    *   ② 系统模型 (System model, \(p\))
    *   ③ 折扣率 (Discount rate, \(\gamma\))

2.  **奖励的仿射变换不变性 (Affine Transformation Invariance)**
    *   **定理**：如果将奖励函数进行正仿射变换（即 \(r \to ar + b\)，其中 \(a>0\)），最优策略 \(\pi^*\) **不会改变**。
    *   **解释**：整体放大或平移奖励，只会改变最优价值的大小（\(V' = aV^* + \frac{b}{1-\gamma}\)），但不会改变各个动作的相对好坏排序。

---

# 4.4 值迭代与策略迭代 

## 核心思想：用循环迭代代替矩阵求逆
前三章的公式（尤其是贝尔曼最优公式）由于存在非线性（\(\max\)）或状态空间过大，无法直接求出解析解。
第四章引入了**动态规划（Dynamic Programming, DP）**的思想：通过**反复迭代（套娃）**，让价值函数逐步逼近真实值。
*(大前提：必须是**基于模型（Model-based）**，即已知环境转移概率 \(p\) 和奖励 \(r\)。)*

---

## 一、 核心概念与区别

解决 MDP 问题，总围绕着两个步骤交替进行：
1.  **策略评估 (Policy Evaluation, PE)**：给定一个策略 \(\pi\)，算出它的状态价值 \(V_\pi\)。
2.  **策略改进 (Policy Improvement, PI)**：根据算出的 \(V_\pi\)，用贪婪策略更新出更好的策略 \(\pi'\)。

根据这两步结合的紧密程度，衍生出三种算法：

*   **策略迭代 (Policy Iteration)**：完全评估（算到收敛），然后改进。交替循环。
*   **值迭代 (Value Iteration)**：评估一步（不收敛），马上改进。直接一步到位。
*   **截断策略迭代 (Truncated Policy Iteration)**：评估有限次（比如 3 次），然后改进。两者之间的折中。

---

## 二、 三大算法详解

### 1. 策略迭代 
整体流程：\(\pi_0 \xrightarrow{PE} V_{\pi_0} \xrightarrow{PI} \pi_1 \xrightarrow{PE} V_{\pi_1} \xrightarrow{PI} \pi_2 \dots\)

*   **Step 1: 策略评估 (PE)**
    对当前策略 \(\pi_k\) 进行迭代，直到 \(V\) 收敛（或误差 \(\|V^{(j+1)} - V^{(j)}\| < \epsilon\)）：
    \[
 V_{\pi_k}^{(j+1)}(s) = \sum_a \pi_k(a|s) \sum_{s', r} p(s', r|s, a) \left[ r + \gamma V_{\pi_k}^{(j)}(s') \right] 
\]
    *(注：这里使用的是贝尔曼期望公式，**没有 \(\max\)**)*。
*   **Step 2: 策略改进 (PI)**
    用收敛的 \(V_{\pi_k}\) 更新策略 \(\pi_{k+1}\)。直接选能让动作价值最大的动作（贪婪策略）：
    \[
 \pi_{k+1}(s) = \arg\max_a \sum_{s', r} p(s', r|s, a) \left[ r + \gamma V_{\pi_k}(s') \right] 
\]
*   **停止条件**：当策略不再改变（即 \(\pi_{k+1} = \pi_k\)）时，算法结束，此时 \(\pi^* = \pi_k\)。



### 2. 值迭代 

整体流程：\(V_k \xrightarrow{\text{算 } q} q_k \xrightarrow{\text{greedy 选优}} \pi_{k+1} \xrightarrow{\text{最大化}} V_{k+1}\)

*(注：值迭代本质上是截断策略迭代在 \(J=1\) 时的特例，即每轮评估只算一步就立刻改进)*

*   **Step 1: 计算 q-Value**
    基于上一轮的价值 \(V_k\)，计算在状态 \(s\) 下采取各个动作 \(a\) 的 q 值（贝尔曼期望）：
    \[
 q_k(s, a) = \sum_{s', r} p(s', r|s, a) \left[ r + \gamma V_k(s') \right] 
\]

*   **Step 2: 策略更新**
    根据算出的 \(q_k(s, a)\)，使用贪婪策略（greedy）直接提取当前最优的动作，更新策略：
    \[
 \pi_{k+1}(s) = \arg\max_a q_k(s, a) 
\]
  
*   **Step 3: 价值更新**
    将新的策略对应的最大 q 值，作为当前状态的新的价值 \(V_{k+1}\)（这就是贝尔曼最优公式的体现）：
    \[
 V_{k+1}(s) = \max_a q_k(s, a) 
\]

*   **停止条件**：当价值不再改变（即 \(\|V_{k+1} - V_k\| < \epsilon\)）时，算法收敛，\(\pi^* = \pi_{k+1}\)。



### 3. 截断策略迭代

整体流程：\(\pi_k \xrightarrow{J\text{次评估}} V_{\pi_k}^{(J)} \xrightarrow{\text{greedy 选优}} \pi_{k+1} \dots\)

*   **Step 1: 截断的策略评估 (Truncated Evaluation)**
    锁定当前策略 \(\pi_k\)，用贝尔曼期望公式对 \(V\) 进行迭代。只循环计算 \(J\) 次得到近似的价值 \(V_{\pi_k}^{(J)}\)。
    \[
 V_{\pi_k}^{(j+1)}(s) = \sum_a \pi_k(a|s) \sum_{s', r} p(s', r|s, a) \left[ r + \gamma V_{\pi_k}^{(j)}(s') \right] 
\]
    *(其中 \(j\) 从 \(0\) 循环到 \(J-1\))*。

*   **Step 2: 策略更新 (Policy Update / 改进)**
    拿着截断算出来的 \(V_{\pi_k}^{(J)}\)，去计算所有的 q 值，然后用贪婪策略提取出新策略 \(\pi_{k+1}\)：
    \[
 \pi_{k+1}(s) = \arg\max_a \sum_{s', r} p(s', r|s, a) \left[ r + \gamma V_{\pi_k}^{(J)}(s') \right] 
\]

*   **停止条件**：当策略不再改变（即 \(\pi_{k+1} = \pi_k\)）时，算法结束，此时 \(\pi^* = \pi_k\)。


### 4.三种策略对比

1.  **策略迭代**：\(\pi_k \xrightarrow{\text{评估直到 } V \text{ 收敛}} V_{\pi_k} \xrightarrow{\text{greedy}} \pi_{k+1}\)
2.  **截断策略迭代**：\(\pi_k \xrightarrow{\text{评估 } J \text{ 次}} V_{\pi_k}^{(J)} \xrightarrow{\text{greedy}} \pi_{k+1}\)
3.  **值迭代**：\(V_k \xrightarrow{\text{算一步 } q} q_k \xrightarrow{\text{greedy}} \pi_{k+1} \xrightarrow{\max} V_{k+1}\) （相当于 \(J=1\) 时的截断）

---

## 三、 算法收敛性 
*   **收敛依据**：第三章的**压缩映射定理（Contraction Mapping Theorem）**。
*   无论是哪种算法，本质上都是在反复应用函数 \(f(V) = \max_\pi (R_\pi + \gamma P_\pi V)\)（或策略迭代中的 \(f_k(V) = R_{\pi_k} + \gamma P_{\pi_k} V\)）。
*   因为 \(\gamma \in [0,1)\)，每次迭代都会将价值误差缩小至少 \(\gamma\) 倍。所以不管初始值 \(V_0\) 多离谱，最终都会收敛到唯一的最优值 \(V^*\)。

---

# 4.5. 蒙特卡罗方法 

## 核心思想：无模型下的“大量采样求平均”
*   **痛点**：前四章（动态规划）需要知道环境模型 \(p(s'|s,a)\)（上帝视角）。但在现实中，环境往往是个黑盒。
*   **破局**：MC 方法彻底摒弃了环境模型（**Model-free**），依靠**大量采样**。在同一个状态-动作对 \((s,a)\) 出发，跑出很多条真实的轨迹（Episode），算出每次的折扣回报 \(G_t\)，最后用这些样本的**算术平均值**来估计真实的动作价值 \(q_\pi(s,a)\)。

---

## 一、 核心公式 

### 1. 动作价值的定义
\[
 q_\pi(s,a) = \mathbb{E}_\pi[G_t | S_t = s, A_t = a] 
\]
*   这是理论上真实的动作价值，但在无模型下，这个期望是**未知**的。

### 2. 蒙特卡罗的采样近似公式
因为没有环境模型，我们只能通过大量采样来估计这个期望：
\[
 q_\pi(s,a) \approx \frac{1}{N} \sum_{i=1}^N g^{(i)}(s,a) 
\]
*   **🟢 已知（采样得到）**：\(g^{(i)}(s,a)\) 表示第 \(i\) 次从 \((s,a)\) 出发得到的真实的折扣回报（也就是 \(G_t\)）。\(N\) 是采样的次数。
*   **🔴 未知（要估计的）**：真实价值 \(q_\pi(s,a)\)。
*   *(注：笔记右上角特别标注了，这里是用大量采样来近似期望，也就是用样本均值代替真实期望。)*

---

## 二、 策略迭代的两步走

MC 方法同样遵循“策略评估”和“策略改进”的交替逻辑。

### Step 1: 策略评估
从每一个 \((s,a)\) 出发，根据当前策略 \(\pi\) 跑出很多条轨迹，用上述的**求和取平均**公式，计算出当前策略下所有动作价值的估计值 \(q_{\pi_k}(s,a)\)。

### Step 2: 策略改进
利用算出的 \(q_{\pi_k}(s,a)\)，使用贪婪策略更新：
\[
 \pi_{k+1}(s) = \arg\max_a q_{\pi_k}(s,a) 
\]
*(例如：算出 \(S_1\) 下五个动作的 \(q\) 值，发现 \(a_2\) 或 \(a_3\) 最大，于是令 \(\pi_1(a_2|S_1) = 1\))*。

---

## 三、 数据浪费与利用

*   **Initial-visit method (首次访问法)**：如果一条轨迹里绕路经过了两次 \((S_1, a_2)\)，只算第一次的回报。**缺点：有数据浪费**（因为后续的数据被丢弃了）。
*   **MC Exploring Starts (探索性起点)**：为了解决某些状态永远走不到的问题，强制让每一条 Episode 都从一个随机的 \((S_1, a_1)\) 开始。这样可以保证每个 \((s,a)\) 都能被采样到。

---

## 四、 探索策略：\(\epsilon\)-greedy

为了平衡**探索（Exploration）**和**利用（Exploitation）**，引入了 \(\epsilon\)-greedy 策略：

\[
 \pi(a|s) = \begin{cases} 1 - \epsilon + \frac{\epsilon}{|A(s)|}, & a = \arg\max_a q_\pi(s,a) \text{ (greedy action)} \\ \frac{\epsilon}{|A(s)|}, & a \neq \arg\max_a q_\pi(s,a) \text{ (其他动作)} \end{cases} 
\]

*   \(\epsilon \in [0, 1]\)。
*   \(|A(s)|\) 是当前状态下动作的数量。
*   **作用**：以 \(1-\epsilon\) 的概率选当前最优动作，以 \(\epsilon\) 的概率在所有动作中随机选。

---

## 五、 算法总结

```text
初始化：空的价值表 q(s,a)，空的历史记录表 returns(s,a)
对于每一局 Episode (循环)：
    1. 用当前策略 π (如 ε-greedy) 生成一整条轨迹：S0, A0, R1, S1, A1, R2, ..., S_T
    2. 倒推计算轨迹中每一个时刻 t 的折扣回报 G_t
    3. 遍历轨迹中的每一个 (S_t, A_t)：
        将 G_t 加入 returns(S_t, A_t) 的列表中
        计算平均值：q(S_t, A_t) = average( returns(S_t, A_t) )
    4. 策略改进：π(s) = argmax_a q(s,a)
```
---
# 4.6 随机近似与随机梯度下降 

## 核心思想：从“全量计算”到“增量更新”
*   **痛点**：求期望或平均值时，需要收集所有数据再求平均。数据量大时内存会爆炸。
*   **破局**：引入**随机近似（SA）**与**随机梯度下降（SGD）**。不需要全量数据，只通过“带噪声的单次观测”进行增量式迭代，逼近真实期望或求解方程根。

---

## 一、 随机近似与RM算法

### 1. RM 算法核心公式
要求解方程 \(g(w) = 0\)，但 \(g\) 未知（黑盒），只能观测到带噪声的值 \(\tilde{g}(w_k, \eta_k) = g(w_k) + \eta_k\)。
*   **RM 迭代公式**：
    \[
 w_{k+1} = w_k - \alpha_k \tilde{g}(w_k, \eta_k) 
\]
    *(注：\(\alpha_k > 0\)，当观测函数值大于 0 时，向左走；小于 0 时，向右走)*。

### 2. RM 算法收敛性条件
数学上证明，只要满足以下三大条件，\(w_k\) 必定收敛到真实根 \(w^*\)（即 \(g(w^*)=0\)）：

1.  **梯度有界（保证方向正确）**：\(0 < c_1 \le \nabla g(w) \le c_2\) 对任意 \(w\) 成立。
    *   *(保证函数是单调递增的，方向不会反)*。
2.  **步长条件（保证能到达且不乱跳）**：
    *   \(\sum_{k=1}^\infty \alpha_k = \infty\)：**和发散**（步子不能衰减太快，保证能走到终点）。
    *   \(\sum_{k=1}^\infty \alpha_k^2 < \infty\)：**平方和收敛**（步子最终必须趋于 0，消除随机噪声的震荡）。
3.  **噪声条件（保证随机性可控）**：
    *   \(\mathbb{E}[\eta_k | \mathcal{H}_k] = 0\)：噪声均值为 0（无偏）。
    *   \(\mathbb{E}[\eta_k^2 | \mathcal{H}_k] < \infty\)：噪声方差有界（不能有无限大的极端异常值）。

---

## 二、 随机梯度下降 (SGD)

SGD 是优化问题最常用的算法，本质上是 RM 算法的一个特例。

### 1. SGD 的推导与公式
目标：最小化 \(J(w) = \mathbb{E}[f(w, X)]\)。
*   真实梯度 \(\nabla J(w) = \mathbb{E}[\nabla_w f(w, X)]\) 包含期望符号，无法直接计算。
*   **SGD 破局**：每次随机抽一个样本 \(x_k\)，用单样本梯度 \(\nabla_w f(w_k, x_k)\) 代替真实梯度。
    \[
 w_{k+1} = w_k - \alpha_k \nabla_w f(w_k, x_k) 
\]

### 2. SGD 算法收敛性条件
因为 SGD 是特殊的 RM 算法，所以它也天然满足并需要以下条件：
1.  **步长条件**：\(\sum \alpha_k = \infty\) 且 \(\sum \alpha_k^2 < \infty\)。
2.  **样本要求**：\(\{x_k\}_{k=1}^\infty\) 必须是 **独立同分布 (i.i.d)** 的。*(这是深度学习中打乱数据 Shuffle 的理论依据)*。
3.  **函数要求**：目标函数有界，且梯度满足 Lipschitz 连续等。
*   **结论**：满足上述条件时，SGD 必能收敛到令真实梯度 \(\nabla J(w^*) = 0\) 的点。


---

## 三、 BGD / MBGD / SGD对比
假设我们有 \(n\) 个样本，进行 \(k\) 次迭代（学习率设为 \(\alpha_k = \frac{1}{k}\)）。

### 1. BGD
*   **公式**：每次利用**所有 \(n\) 个样本**计算平均梯度。
    \[
 w_{k+1} = w_k - \alpha_k \frac{1}{n} \sum_{i=1}^n \nabla f(w_k, x_i) 
\]
*   **在均值估计问题中**：若 \(\alpha_k = \frac{1}{k}\)，可以推导出 \(w_{k+1} = \frac{1}{k} \sum_{j=1}^k \bar{x} = \bar{x}\)。也就是直接收敛到全量均值。

### 2. MBGD
*   **公式**：每次从 \(n\) 个样本中随机抽取 \(m\) 个样本（Mini-batch，记为 \(I_k\)）。
    \[
 w_{k+1} = w_k - \alpha_k \frac{1}{m} \sum_{j \in I_k} \nabla f(w_k, x_j) 
\]
*   **在均值估计问题中**：\(w_{k+1} = \frac{1}{k} \sum_{j=1}^k \bar{x}_j^{(m)}\)。也就是利用每次抽出的 \(m\) 个样本的局部均值 \(\bar{x}^{(m)}\) 来进行更新。

### 3. SGD
*   **公式**：每次只抽取 **\(1\) 个样本**。
    \[
 w_{k+1} = w_k - \alpha_k \nabla f(w_k, x_k) 
\]
*   **在均值估计问题中**：\(w_{k+1} = \frac{1}{k} \sum_{j=1}^k x_j\)。也就是不断利用单个新样本更新滑动平均值。

| 方法 | 每次使用的数据量 | 梯度特点 | 运算速度 |
| :--- | :--- | :--- | :--- |
| **BGD** | 全部 \(n\) 个 | 准确，无偏 | 极慢，内存要求高 |
| **MBGD** | 随机 \(m\) 个 (\(1<m<n\)) | 较准，方差适中 | 适中 (深度学习主流) |
| **SGD** | 随机 \(1\) 个 | 噪声大，方差大 | 极快 |

---

# 4.7时序差分方法 

## 核心思想：无模型下的“增量式迭代”与“自举”
*   **痛点**：MC（蒙特卡罗）必须等一整局结束拿到真实的 \(G_t\) 才能更新，方差极大；动态规划（DP）又需要全知全能的上帝视角（环境概率 \(p\)）。
*   **破局**：TD 算法结合了两者。它走一步就能更新（像 DP 一样增量迭代），同时不需要知道环境模型（像 MC 一样基于采样）。
*   **核心机制：自举 (Bootstrapping)**。TD 走一步拿到真实的即时奖励 \(R_{t+1}\)，然后用**脑子里对下一步价值的猜测值**来填补未来的空白。
*   **数学本质**：TD 是 RM（随机近似）算法在贝尔曼方程上的应用。用“单样本的真实观测”代替了“无法计算的期望 \(\mathbb{E}\)”。

---

## 一、 核心概念与基础公式

### 1. 关键定义
*   **TD Target（目标值 \(\bar{V}_t\)）**：\(R_{t+1} + \gamma V(S_{t+1})\)
    *(用真实的单步奖励与对下一步的估计拼凑出的目标值)*
*   **TD Error（误差 \(\delta_t\)）**：\(V(S_t) - \bar{V}_t\)
    *(当前估计值与目标值的差距。只要 \(V_t = V_\pi\)，该误差的期望就是 0)*。

### 2. TD(0) 状态价值更新公式
\[
 V_{t+1}(S_t) = V_t(S_t) + \alpha_t(S_t) \Big[ \underbrace{R_{t+1} + \gamma V_t(S_{t+1})}_{\text{TD Target}} - V_t(S_t) \Big] 
\]

---

## 二、 控制算法

所有 TD 控制算法都遵循统一的更新框架：
\[
 Q_{new}(S_t, A_t) = Q_{old}(S_t, A_t) + \alpha \Big[ \text{Target} - Q_{old}(S_t, A_t) \Big] 
\]
唯一的区别在于 **Target** 的表达式：

### 1. Sarsa (On-policy)
*   **核心思想**：表里如一。用**真实选出的**下一步动作 \(A_{t+1}\) 来算目标。
*   **公式**：
    \[
 Q_{new}(S_t, A_t) = Q_{old}(S_t, A_t) + \alpha \Big[ R_{t+1} + \gamma Q_{old}(S_{t+1}, A_{t+1}) - Q_{old}(S_t, A_t) \Big] 
\]
*   **已知 vs 未知**：
*   🟢 **已知**：\(R_{t+1}\)（真实奖励）、\(S_{t+1}, A_{t+1}\)（真实到达的下个状态及选出的动作）、\(Q_{old}(S_{t+1}, A_{t+1})\)（查表旧值）。
*   🔴 **未知**：\(Q_{new}(S_t, A_t)\)。

### 2. Q-learning (Off-policy)
*   **核心思想**：心里有梦。不管现实怎么走，算 Target 永远假设下一步选**最大值**。
*   **公式**：
    \[
 Q_{new}(S_t, A_t) = Q_{old}(S_t, A_t) + \alpha \Big[ R_{t+1} + \gamma \max_a Q_{old}(S_{t+1}, a) - Q_{old}(S_t, A_t) \Big] 
\]
*   **已知 vs 未知**：
*   🟢 **已知**：\(R_{t+1}\)（真实奖励）、\(S_{t+1}\)（真实到达的下个状态）、\(\max_a Q_{old}(S_{t+1}, a)\)（查表求最大值）。
*   🔴 **未知**：\(Q_{new}(S_t, A_t)\)。

### 3. Expected Sarsa
*   **核心思想**：精算师。不随机抽，把所有动作按概率求**期望**，方差更小。
*   **公式**：
    \[
 Q_{new}(S_t, A_t) = Q_{old}(S_t, A_t) + \alpha \Big[ R_{t+1} + \gamma \sum_a \pi(a|S_{t+1}) Q_{old}(S_{t+1}, a) - Q_{old}(S_t, A_t) \Big] 
\]
*   **已知 vs 未知**：
*   🟢 **已知**：\(R_{t+1}\)、\(S_{t+1}\)、\(\pi(a|S_{t+1})\)（策略概率）、\(Q_{old}(S_{t+1}, a)\)。
*   🔴 **未知**：\(Q_{new}(S_t, A_t)\)。

### 4. n-step Sarsa
*   **核心思想**：折中派。走 \(n\) 步真实环境，拿 \(n\) 步的真实奖励，剩下的再用 \(Q\) 表猜。
*   **公式**：
    \[
 Q_{new}(S_t, A_t) = Q_{old}(S_t, A_t) + \alpha \Big[ R_{t+1} + \gamma R_{t+2} + \dots + \gamma^n Q_{old}(S_{t+n}, A_{t+n}) - Q_{old}(S_t, A_t) \Big] 
\]
*   **已知 vs 未知**：
*   🟢 **已知**：\(R_{t+1} \dots R_{t+n}\)（真实奖励序列）、\(S_{t+n}, A_{t+n}\)、\(Q_{old}(S_{t+n}, A_{t+n})\)。
*   🔴 **未知**：\(Q_{new}(S_t, A_t)\)。

---

## 三、 核心概念辨析与统一视角

### 1. On-policy vs Off-policy
*   **On-policy (Sarsa)**：Behavior Policy = Target Policy。生成数据的策略和评估优化的策略相同（保守，会避开探索带来的风险）。
*   **Off-policy (Q-learning)**：Behavior Policy \(\neq\) Target Policy。可以用带探索的策略生成数据，但学的是最优策略（激进，直指最优解）。

### 2. Target 表达式的终极对比
| 算法 | Target 表达式 | 依据方程 |
| :--- | :--- | :--- |
| **Sarsa** | \(R_{t+1} + \gamma Q(S_{t+1}, A_{t+1})\) | 贝尔曼期望方程 (BE) |
| **Expected Sarsa** | \(R_{t+1} + \gamma \sum \pi Q(S_{t+1}, a)\) | 贝尔曼期望方程 (BE) |
| **n-step Sarsa** | \(R_{t+1} + \dots + \gamma^n Q(S_{t+n}, A_{t+n})\) | 贝尔曼期望方程 (BE) |
| **Q-learning** | \(R_{t+1} + \gamma \max_a Q(S_{t+1}, a)\) | **贝尔曼最优方程 (BOE)** |
| **Monte Carlo** | \(G_t = R_{t+1} + \gamma R_{t+2} + \dots\) | 纯真实回报 (无自举) |
---
# 4.8. 值函数近似
## 核心思想：从“查表”到“拟合函数”
*   **痛点**：前七章的表格法（Tabular）在状态空间巨大或连续时，内存存不下（维度灾难）。
*   **破局**：用一个带参数 \(w\) 的数学函数 \(\hat{V}(s, w)\) 来近似真实的状态价值 \(V_\pi(s)\)。
*   **目标**：寻找最优的参数 \(w\)，使得对所有状态 \(s\)，\(\hat{V}(s, w)\) 都能最好地近似 \(V_\pi(s)\)。

---

## 一、 目标函数定义与状态分布


### Method 1: 均匀分布
\[
 J(w) = \mathbb{E}[(V_\pi(S) - \hat{V}(S, w))^2] = \frac{1}{|S|} \sum_{s \in S} (V_\pi(s) - \hat{V}(s, w))^2 
\]
*   **缺点**：假设所有状态分布概率相同。但事实上，某些状态（如陷阱边）很少被访问，而靠近目标的状态被访问次数多。均匀分布不符合实际。

### Method 2: 平稳分布
*   引入 \(d_\pi(s)\)：在策略 \(\pi\) 下 Markov 过程的长期行为（平稳分布）。\(d_\pi(s) \ge 0\)，且 \(\sum_{s \in S} d_\pi(s) = 1\)。
*   **目标函数**：
    \[
 J(w) = \mathbb{E}[(V_\pi(S) - \hat{V}(S, w))^2] = \sum_{s \in S} d_\pi(s) (V_\pi(s) - \hat{V}(s, w))^2 
\]
*   **物理意义**：某些状态频繁被访问，它们在目标函数中的权重（即 \(d_\pi(s)\)）就比其他罕见状态更高。

---

## 二、 优化目标函数：梯度下降

利用梯度下降算法最小化 \(J(w)\)：
\[
 w_{k+1} = w_k - \alpha_k \nabla_w J(w_k) 
\]

对 \(J(w)\) 求导：
\[
 \nabla_w J(w) = \nabla_w \mathbb{E}[(V_\pi(S) - \hat{V}(S, w))^2] = -2\mathbb{E}[(V_\pi(S) - \hat{V}(S, w)) \nabla_w \hat{V}(S, w)] 
\]

### 1. 理论更新公式
\[
 w_{t+1} = w_t + \alpha_t \Big( V_\pi(S_t) - \hat{V}(S_t, w_t) \Big) \nabla_w \hat{V}(S_t, w_t) 
\]
*   **不可行原因**：需要真实的 \(V_\pi(S_t)\)，这是未知的。

### 2. 实际替代方案
*   **Method 1 (MC 替代)**：用真实的回报 \(G_t\) 替代 \(V_\pi(S_t)\)。
    \[
 w_{t+1} = w_t + \alpha_t (G_t - \hat{V}(S_t, w_t)) \nabla_w \hat{V}(S_t, w_t) 
\]
*   **Method 2 (TD 替代)**：用 TD Target \(R_{t+1} + \gamma \hat{V}(S_{t+1}, w_t)\) 替代。
    \[
 w_{t+1} = w_t + \alpha_t (R_{t+1} + \gamma \hat{V}(S_{t+1}, w_t) - \hat{V}(S_t, w_t)) \nabla_w \hat{V}(S_t, w_t) 
\]

---

## 三、 函数的选择与“查表退化”

### 1. 线性函数
\[
 \hat{V}(s, w) = \phi^T(s) w 
\]
*   \(\phi(s)\)：特征向量（人为设计）。此时 \(\nabla_w \hat{V}(s, w) = \phi(s)\)。
*   更新公式变为：\(w_{t+1} = w_t + \alpha_t (R_{t+1} + \gamma \phi^T(S_{t+1}) w_t - \phi^T(S_t) w_t) \phi(S_t)\)

### 2. 神经网络 (非线性逼近)
用神经网络代替 \(w^T \phi(s)\)，输入 \(s\) 得到 \(\hat{V}(s, w)\)，梯度通过反向传播计算。

### 3. 退化证明（变成 Tabular TD）
令 \(\phi(s_t) = e_{s_t}\) （One-hot 向量，只有状态所在位置是 1，其余为 0）。
代入线性更新公式，向量中只更新了状态 \(s_t\) 对应的那一个元素：
\[
 w_{t+1}(s_t) = w_t(s_t) + \alpha_t (R_{t+1} + \gamma w_t(S_{t+1}) - w_t(s_t)) 
\]
*   **结论**：这完美等价于第七章的**表格 TD 算法**！证明函数拟合法是更广义的框架。

---

## 四、 动作价值近似：Sarsa 与 Q-learning 

当我们不再评估状态价值 \(V\)，而是评估动作价值 \(Q\) 时，只需把上一节的 \(V(s)\) 替换为 \(Q(s,a)\)，并用函数 \(\hat{q}(s, a, w)\) 来近似。

### 1. Sarsa(On-policy)

*   **目标**：利用真实的下一步动作来更新当前的动作价值。
*   **Value Update (参数更新公式)**：
    \[
 w_{t+1} = w_t + \alpha_t \Big[ R_{t+1} + \gamma \hat{q}(S_{t+1}, A_{t+1}, w_t) - \hat{q}(S_t, A_t, w_t) \Big] \nabla_w \hat{q}(S_t, A_t, w_t) 
\]
    **已知 vs 未知**：
    🟢 **已知**：\(R_{t+1}, S_{t+1}, A_{t+1}\) (真实环境反馈及真实选出的动作)、当前参数 \(w_t\)、查表/网络输出 \(\hat{q}\)、梯度 \(\nabla_w \hat{q}\)。
    🔴 **未知**：更新后的网络参数 \(w_{t+1}\)。
*   **Policy Update (策略更新公式)**：
    利用更新后的网络参数，使用 \(\epsilon\)-greedy 更新策略 \(\pi_{t+1}\)：
    \[
 \pi_{t+1}(a|s_t) = \begin{cases} 1 - \frac{\epsilon}{|A(s_t)|}(|A(s_t)| - 1), & a = \arg\max_a \hat{q}(s_t, a, w_{t+1}) \\ \frac{\epsilon}{|A(s_t)|}, & \text{其他动作} \end{cases} 
\]
    *(含义：以 \(1-\epsilon\) 的概率选网络预测值最大的动作，以 \(\epsilon\) 的概率随机选。)*

### 2. Q-learning (Off-policy)

*   **目标**：利用下一步的最优动作价值来更新当前动作价值。
*   **Value Update (参数更新公式)**：
    \[
 w_{t+1} = w_t + \alpha_t \Big[ R_{t+1} + \gamma \max_{a \in A(S_{t+1})} \hat{q}(S_{t+1}, a, w_t) - \hat{q}(S_t, A_t, w_t) \Big] \nabla_w \hat{q}(S_t, A_t, w_t) 
\]
    **已知 vs 未知**：
    🟢 **已知**：\(R_{t+1}, S_{t+1}\)、当前参数 \(w_t\)、把 \(S_{t+1}\) 喂给网络后得到的所有动作的最大 \(\hat{q}\) 值、以及针对当前动作的梯度。
    🔴 **未知**：更新后的网络参数 \(w_{t+1}\)。
*   **Policy Update (策略更新公式)**：
    和 Sarsa 完全一样，依然是用 \(\epsilon\)-greedy 选动作。



### 3.核心区别总结（在函数近似下）：
1.  **Sarsa 的目标值**：用的是 \(A_{t+1}\)（必须是通过 \(\epsilon\)-greedy 真实采样出来的动作）。
2.  **Q-learning 的目标值**：用的是 \(\max_a\)（是网络对下一步所有动作的预测中，数值最大的那个）。


---

## 五、 Deep Q-Learning (DQN)

当 \(\hat{q}\) 用深度神经网络表示时，直接用上面的 Q-learning 公式会导致极不稳定。

### 1. 目标函数
\[
 \min_w J(w) = \mathbb{E} \Big[ \Big( R + \gamma \max_{a \in A(S')} \hat{q}(S', a, w) - \hat{q}(S, A, w) \Big)^2 \Big] 
\]
其中 \((S, A, R, S')\) 是随机变量,\(s'\)是\(s\)的下一状态。

### 2. 梯度下降法
假设target中的 \(w\) 是**固定**的来计算（虽然实际上它在变）：
\[
 \nabla_w J = \mathbb{E} \Big[ \Big( R + \gamma \max_a \hat{q}(S', a, w) - \hat{q}(S, A, w) \Big) \nabla_w \hat{q}(S, A, w) \Big] 
\]

### 3. DQN 的两大护法
*   **护法一：目标网络 (Target Network)**
    *   引入 \(w_T\) 代表 target network，\(w\) 代表 main network。
    *   \(J = \mathbb{E} \Big[ \big( R + \gamma \max_a \hat{q}(S', a, w_T) - \hat{q}(S, A, w) \big)^2 \Big]\)
    *   当 \(w_T\) 固定，\(\nabla_w J = \mathbb{E} \Big[ \big( R + \gamma \max_a \hat{q}(S', a, w_T) - \hat{q}(S, A, w) \big) \nabla_w \hat{q}(S, A, w) \Big]\)
*   **护法二：经验回放 (Experience Replay)**
    *   将交互数据 \((s, a, r, s')\) 放入 Replay buffer \(\mathcal{B}\)。
    *   每次训练时，从 \(\mathcal{B}\) 中**均匀随机抽样**一个小批量（mini-batch），打破时间相关性，满足 i.i.d 假设。

### 4. DQN 算法伪代码 (Off-policy)
```text
初始化：主网络参数 w，目标网络参数 w_T (令 w_T = w)，经验池 B
每次迭代 (each episode):
    用 ε-greedy 策略生成 (s, a, r, s') 并放入 B
    从 B 中随机抽取一小批 (mini-batch) 数据
    计算目标值：y_T = r + γ * max_a q(s', a, w_T)
    计算损失并梯度下降：min (y_T - q(s, a, w))^2，更新主网络 w
    每 C 次迭代，同步参数：w_T = w
```
---
# 4.9 策略梯度法 

## 核心思想：从“间接算价值”到“直接学策略”
*   **痛点**：前八章（如 DQN）是基于价值的（Value-based），需要先算出 Q 值，再通过 \(\arg\max\) 选动作。这在处理连续动作或巨大动作空间时极其困难，且通常是确定性策略。
*   **破局**：直接参数化策略 \(\pi(a|s, \theta)\)（\(\theta \in \mathbb{R}^m\) 为网络参数）。通过**梯度上升**更新参数 \(\theta\)，使得期望收益 \(J(\theta)\) 最大化。

---

## 一、 定义目标函数 \(J(\theta)\)

如何衡量一个策略网络 \(\pi(a|s, \theta)\) 的好坏？有两种等价的指标：

### 1. Average Value
\[
 \bar{v}_\pi = \sum_{s \in S} d(s) V_\pi(s) 
\]
*   \(d(s)\) 是状态分布（权重），\(\sum d(s) = 1\)。
*   **Case 1**：如果 \(d\) 与策略 \(\pi\) 独立（例如所有状态等概率访问 \(d(s) = 1/|S|\)），则 \(\bar{v}_\pi = V_\pi^0\)。
*   **Case 2**：如果 \(d\) 与策略 \(\pi\) 相关（即策略 \(\pi\) 下的平稳分布 \(d_\pi\)），则 \(\bar{v}_\pi = \mathbb{E}_{S \sim d_\pi}[V_\pi(S)]\)。这是最常用的。

### 2. Average Reward 
\[
 \bar{r}_\pi = \sum_{s \in S} d_\pi(s) r_\pi(s) 
\]
*   两者关系：\(\bar{r}_\pi = (1 - \gamma) \bar{v}_\pi\)。

---

## 二、 策略梯度定理 

我们需要计算目标函数对参数 \(\theta\) 的梯度 \(\nabla_\theta J(\theta)\)。这是全章最核心的数学推导。

### 1. 推导过程
因为状态分布 \(d_\pi(s)\) 和状态价值 \(q_\pi(s,a)\) 都依赖于 \(\theta\)，直接求导极其复杂。数学家利用对数求导技巧 \(\nabla_\theta \pi = \pi \nabla_\theta \ln \pi\)，消去了环境模型的依赖，得到：

\[
 \nabla_\theta J(\theta) = \sum_{s \in S} \eta(s) \sum_{a \in A} \nabla_\theta \pi(a|s, \theta) q_\pi(s, a) 
\]
*(注：\(\eta(s)\) 代表状态分布或权重)*。

### 2. 转化为期望形式 
\[
 \nabla_\theta J(\theta) = \mathbb{E}_{S \sim \eta, A \sim \pi(\cdot|S, \theta)} \Big[ \nabla_\theta \ln \pi(A|S, \theta) q_\pi(S, A) \Big] 
\]
**已知 vs 未知**：
🟢 **已知（采样得到）**：\(\nabla_\theta \ln \pi(A|S, \theta)\)（策略网络梯度）、\(q_\pi(S, A)\)（动作价值，可由 MC 或 TD 估算）。
🔴 **未知（要更新）**：网络参数 \(\theta\)。

---

## 三、 算法实现

有了梯度公式，代码怎么跑？因为公式里有 \(q_\pi(s,a)\)，最简单粗暴的方法就是用 MC（蒙特卡罗）跑完一整局，用真实的折扣回报 \(q_t(s_t, a_t)\) 来无偏估计。

**更新公式**：
\[
 \theta_{t+1} = \theta_t + \alpha \nabla_\theta \ln \pi(a_t|s_t, \theta_t) q_t(s_t, a_t) 
\]
*(注：这里是加号，属于梯度**上升**)*

### 伪代码 (REINFORCE)
```text
初始化：可微策略网络参数 θ，学习率 α
对于第 k 次迭代：
    用当前策略 π(θ_k) 生成一整条轨迹：S0, A0, R1, ..., S_{T-1}, A_{T-1}, R_T
    对于轨迹中的每一个时刻 t (从 0 到 T-1):
        # 1. 计算真实的折扣回报 (MC)
        q_t = Σ_{k=t+1}^{T} γ^{k-t-1} R_k
        # 2. 计算梯度并更新参数 (梯度上升)
        θ_{t+1} = θ_t + α ∇_θ ln π(A_t|S_t, θ_t) * q_t
        θ_k = θ_t
```

---
## 四、参数更新如何改变概率

笔记中用了一阶泰勒展开，从微观角度完美解释了为什么这个梯度公式能让好动作的概率变大。

定义系数 \(\beta_t\)：
\[
 \beta_t = \frac{q_t(s_t, a_t)}{\pi(a_t|s_t, \theta_t)} 
\]
此时，策略更新的梯度公式可以写为：
\[
 \theta_{t+1} = \theta_t + \alpha \beta_t \nabla_\theta \pi(a_t|s_t, \theta_t) 
\]

利用一阶泰勒展开，当 \(\theta_{t+1} - \theta_t\) 足够小时，新策略的概率近似为：
\[
 \pi(a_t|s_t, \theta_{t+1}) \approx \pi(a_t|s_t, \theta_t) + [\nabla_\theta \pi(a_t|s_t, \theta_t)]^T (\theta_{t+1} - \theta_t) 
\]

将 \(\theta_{t+1} - \theta_t\) 替换为 \(\alpha \beta_t \nabla_\theta \pi\)，得到最终结论：
\[
 \pi_{new} \approx \pi_{old} + \alpha \beta_t \| \nabla_\theta \pi(a_t|s_t, \theta_t) \|^2 
\]

**核心分析（为什么这么更新？）：**
*   **当 \(q_t > 0\) 时**：\(\beta_t > 0\)，则 \(\pi_{new} > \pi_{old}\)。意味着如果动作带来了正收益，网络参数会朝着**增大该动作概率**的方向更新（梯度上升）。
*   **当 \(q_t < 0\) 时**：\(\beta_t < 0\)，则 \(\pi_{new} < \pi_{old}\)。意味着动作导致了负面结果，网络会**减小该动作的概率**。

**系数 \(\beta_t\) 的隐藏机制（平衡探索与利用）：**
*   如果某动作的 \(q_t\) 很大（价值高），但当前策略选它的概率 \(\pi\) 很小（处于被忽视的状态），\(\beta_t\) 会变得**非常大**。网络会被狠狠地“纠正”，强制拉高这个动作的概率，体现了**探索（Exploration）**。
*   如果策略本来就经常选这个动作（\(\pi\) 很大），则 \(\beta_t\) 较小，更新幅度会变平缓，体现了**利用（Exploitation）**。

---

## 五、 核心概念与局限性

### 1. 算法性质
*   **On-policy（同策略）**：因为梯度公式中的 \(S \sim \eta\) 和 \(A \sim \pi\) 必须使用**当前最新的策略**采样，所以 REINFORCE 属于 On-policy。采集完数据更新一次参数后，旧数据就作废了（样本效率低）。

### 2. 痛点与改进
*   **高方差（High Variance）**：REINFORCE 依赖一整局跑完的真实回报 \(G_t\)（即蒙特卡罗方法）。单条轨迹的随机性极大，导致梯度估计的方差极高，训练容易不收敛。
*   **Baseline（基线技巧）**：为了降低方差，通常会在目标值中减去一个基线（通常是状态价值 \(V(s)\)）。即把更新公式变成 \(q_t(s_t, a_t) - V(s_t)\)。
    *   *原理*：减去基线不会改变梯度的期望（无偏），但能极大减小梯度的波动。如果动作比平均水平好（\(q > V\)），就增加概率；比平均水平差，就减小概率。
    *   *引子*：**这个 Baseline 其实就是第十章 Actor-Critic（演员-评论家）架构中“评论家”网络的前身。**


---
# 4.10 Actor-Critic 

## 核心思想：决策与评估的融合
在前面的章节中，基于价值的方法（如 DQN）难以处理连续动作；基于策略的方法（如 REINFORCE）方差极大，且必须等一整局结束才能更新。
**Actor-Critic (AC)** 架构将两者完美结合：**Actor（演员，参数 \(\theta\)）** 负责输出策略 \(\pi(a|s, \theta)\) 做出决策；**Critic（评论家，参数 \(w\)）** 负责评估这个动作或状态的价值。Actor 根据 Critic 的打分来更新自己，实现了单步更新，大幅降低了方差。

---

## 一、基础的 Actor-Critic 

### 1.核心算法思想与数据生成
这个最基础的版本，Critic 评估的是**动作价值 \(q(s, a, w)\)**，Actor 直接利用这个 \(Q\) 值作为权重来更新策略。

**具体流程**：在状态 \(s_t\)，Actor 根据 \(\pi(\cdot|s_t, \theta_t)\) 生成动作 \(a_t\)；环境返回奖励 \(r_{t+1}\) 和新状态 \(s_{t+1}\)；为了计算目标值，Critic 还会要求 Actor 在 \(s_{t+1}\) 根据同样的策略再生成一个动作 \(a_{t+1}\)。
### 2.算法过程
**Critic 的更新（评估 Q 值）：**
利用 TD Error（时序差分误差）更新网络参数 \(w\)。
\[
 \delta_t = r_{t+1} + \gamma q(s_{t+1}, a_{t+1}, w_t) - q(s_t, a_t, w_t) 
\]
\[
 w_{t+1} = w_t + \alpha_w \delta_t \nabla_w q(s_t, a_t, w_t) 
\]

**Actor 的更新（更新策略）：**
直接用 Critic 算出的 \(q\) 值作为权重（梯度上升）。
\[
 \theta_{t+1} = \theta_t + \alpha_\theta q_t(s_t, a_t, w_{t+1}) \nabla_\theta \ln \pi(a_t|s_t, \theta_t) 
\]

*   🟢 **已知量（环境与交互生成）**：
    *   \(s_t, a_t, r_{t+1}, s_{t+1}\)：真实交互产生的数据。
    *   \(a_{t+1}\)：**根据当前策略 \(\pi(\theta_t)\) 生成的**用于计算 Target 的动作。
*   🟢 **已知量（网络前向传播与求导计算）**：
    *   当前网络参数 \(w_t\) 和 \(\theta_t\)。
    *   \(q(s_t, a_t, w_t)\) 和 \(q(s_{t+1}, a_{t+1}, w_t)\)：Critic 网络的输出。
    *   \(\nabla_w q\) 和 \(\nabla_\theta \ln \pi\)：通过反向传播算出的梯度。
    *   \(\alpha_w, \alpha_\theta, \gamma\)：超参数。
*   🔴 **未知量（公式的求解目标）**：
    *   \(w_{t+1}\)：更新后的 Critic 参数。
    *   \(\theta_{t+1}\)：更新后的 Actor 参数。
---

## 二、 Baseline 不变性与 A2C 算法

### 1. 基线不变性

\[
 \nabla_\theta J_\theta
 =\mathbb{E}_{S \sim \eta, A \sim \pi}[\nabla_\theta \ln \pi(A|S, \theta_t) q_\pi(S, A)] 
 = \mathbb{E}_{S \sim \eta, A \sim \pi}[\nabla_\theta \ln \pi(A|S, \theta_t) (q_\pi(S, A) - b(S))] 
\]
*   **结论**：减去 \(b(S)\) 绝对不改变梯度的期望方向，但会改变方差。

### 2. 方差分析与寻找最优基线 
令 \(X(S,A) = \nabla_\theta \ln \pi(A|S, \theta)[q(S,A) - b(S)]\)。因为 \(tr[var(X)] = \mathbb{E}[X^T X] - \bar{X}^T \bar{X}\)，为了最小化方差，通过求导可得到**最优基线公式**：
\[
 b^*(S) = \frac{\mathbb{E}_{A \sim \pi} [\| \nabla_\theta \ln \pi(A|S, \theta) \|^2 q(S,A)]}{\mathbb{E}_{A \sim \pi} [\| \nabla_\theta \ln \pi(A|S, \theta) \|^2]} 
\]

### 3.特殊化为状态价值 \(V(S)\)
最优公式太复杂。通过**改变权重**（忽略分子分母中的 \(\| \nabla_\theta \ln \pi \|^2\) 项），我们可以找到一个次优基线：
\[
 b(S) = \mathbb{E}_{A \sim \pi}[q(S,A)] = V_\pi(S) 
\]

### 4. A2C算法公式
基于上述结论（On-policy，数据由当前策略 \(\pi(a_t|s_t, \theta_t)\) 生成）：
*   **TD Error (作为优势函数的估计)**：
    \[
 \delta_t = r_{t+1} + \gamma V(s_{t+1}, w_t) - V(s_t, w_t) 
\]
*   **Critic 更新 (评估 V 值)**：
    \[
 w_{t+1} = w_t + \alpha_w \delta_t \nabla_w V(s_t, w_t) 
\]
*   **Actor 更新 (使用 \(\delta_t\) 作为权重)**：
    \[
 \theta_{t+1} = \theta_t + \alpha_\theta \delta_t \nabla_\theta \ln \pi(a_t|s_t, \theta_t) 
\]
    *(注：更新步长中的 \(\frac{\delta_t}{\pi}\) 能很好地平衡探索与利用)*。

*   🟢 **已知量**：
    *   真实交互数据 \(s_t, a_t, r_{t+1}, s_{t+1}\)（由策略 \(\pi\) 生成）。
    *   当前网络参数 \(w_t, \theta_t\)。
    *   前向传播输出 \(V(s_t, w_t), V(s_{t+1}, w_t)\)。
    *   反向传播梯度 \(\nabla_w V, \nabla_\theta \ln \pi\)。
*   🔴 **未知量**：
    *   \(w_{t+1}\)：更新后的 Critic 参数。
    *   \(\theta_{t+1}\)：更新后的 Actor 参数。
---
## 三、 重要性采样 

**核心痛点**：在 Off-policy 强化学习中，我们拥有的是行为策略 \(\beta\) 产生的数据，但我们想估计目标策略 \(\pi\) 的期望。直接用这批数据求平均会有偏差，必须引入重要性采样。

### 1. 问题引入
*   设随机变量 \(X \in \{+1, -1\}\)，真实目标分布 \(P_0\) 的期望 \(\mathbb{E}_{X \sim P_0}[X] = 0\)。
*   如果我们用行为分布 \(P_1\) 采样（\(P_1(X=+1)=0.8, P_1(X=-1)=0.2\)），那么样本均值 \(\bar{x} \to \mathbb{E}_{X \sim P_1}[X] = 0.6\)。
*   **发现问题**：\(0.6 \neq 0\)，直接用 \(P_1\) 的样本算平均，无法得到 \(P_0\) 的真实期望。

### 2. 数学转换
如何用 \(P_1\) 的样本估计 \(P_0\) 的期望？利用恒等变形（乘以再除以 \(P_1(x)\)）：
\[
 \mathbb{E}_{X \sim P_0}[X] = \sum_x P_0(x) x = \sum_x P_1(x) \frac{P_0(x)}{P_1(x)} x = \mathbb{E}_{X \sim P_1} \left[ \frac{P_0(X)}{P_1(X)} X \right] 
\]
*   **结论**：只要在 \(P_1\) 的样本前乘以一个**重要性权重** \(\frac{P_0(X)}{P_1(X)}\)，其期望就等价于 \(P_0\) 的期望。

### 3. 样本估计与最终公式
从分布 \(P_1\) 中采样得到 \(\{x_i\}_{i=1}^n\)，定义估计量 \(\bar{f}\)：
\[
 \bar{f} = \frac{1}{n} \sum_{i=1}^n \frac{P_0(x_i)}{P_1(x_i)} x_i 
\]
*   此时 \(\mathbb{E}_{X \sim P_1}[\bar{f}] = \mathbb{E}_{X \sim P_0}[X]\)，且当 \(n \to \infty\) 时，\(\bar{f} \to \mathbb{E}_{X \sim P_0}[X]\)。
*   **方差注意**：\(Var_{X \sim P_1}[\bar{f}] = \frac{1}{n} Var_{X \sim P_1}[\frac{P_0(X)}{P_1(X)} X]\)。如果 \(P_1\) 和 \(P_0\) 差异巨大，方差会非常大。
 
*   如果 \(P_0(x_i) = P_1(x_i)\)，\(\bar{f}\) 退化为普通的样本均值 \(\bar{x}\)。
*   如果 \(P_0(x_i) > P_1(x_i)\)，说明在目标分布中经常出现的样本，在行为分布中很难采到（稀有事件）。此时权重 \(\frac{P_0}{P_1}\) 会很大，用来“拉高”这个稀有样本的权重，修正偏差。

**已知 vs 未知**
*   🟢 **已知量**：来自行为分布 \(P_1\) 的样本 \(x_i\)；概率值 \(P_0(x_i)\) 和 \(P_1(x_i)\)（在强化学习中，这就是策略网络 \(\pi\) 和 \(\beta\) 输出的概率）。
*   🔴 **未知量（待估计）**：目标分布 \(P_0\) 下的真实期望 \(\mathbb{E}_{X \sim P_0}[X]\)。

---
## 四、 Off-policy Actor-Critic

### 1. Off-policy 策略梯度定理 
假设行为策略 \(\beta\) 用于生成样本，目标策略 \(\pi\) 为我们要优化的策略。在折扣因子 \(\gamma \in (0,1)\) 的情况下，目标函数 \(J(\theta)\) 的梯度定理为：
\[
 \nabla_\theta J(\theta) = \mathbb{E}_{S \sim \rho, A \sim \beta} \left[ \frac{\pi(A|S, \theta)}{\beta(A|S)} \nabla_\theta \ln \pi(A|S, \theta) q_\pi(S, A) \right] 
\]
*   **逻辑**：通过引入重要性采样权重 \(\frac{\pi}{\beta}\)，使得我们可以用行为策略 \(\beta\) 产生的样本来估计目标策略 \(\pi\) 的梯度。

### 2. 引入 Baseline 与随机梯度上升
Off-policy 策略梯度对于减去基线 \(b(S)\) 依然保持不变。为了减少误差方差，我们通常选择最优基线 \(b(S) = V_\pi(S)\)。
此时，优势函数 \(A(S,A) = q_t(s_t, a_t) - V_t(s_t)\)。在实际算法中，用 TD Error 来近似表示：
\[
 \delta_t = r_{t+1} + \gamma V(s_{t+1}, w_t) - V(s_t, w_t) 
\]
对应的 Actor 随机梯度上升公式变为：
\[
 \theta_{t+1} = \theta_t + \alpha_\theta \frac{\pi(a_t|s_t, \theta_t)}{\beta(a_t|s_t)} \delta_t \nabla_\theta \ln \pi(a_t|s_t, \theta_t) 
\]

### 3. Off-policy Actor-Critic 
*   **初始化**：给定行为策略 \(\beta(a|s)\)，目标策略 \(\pi(a|s, \theta_0)\)，以及价值网络 \(V(s, w_0)\)。
*   **每一步迭代 (Time step \(t\))**：
    1.  在行为策略 \(\beta(s_t)\) 下生成动作 \(a_t\)，观测到真实奖励 \(r_{t+1}\) 和下一个状态 \(s_{t+1}\)。
    2.  **计算 TD Error (优势函数)**：\(\delta_t = r_{t+1} + \gamma V(s_{t+1}, w_t) - V(s_t, w_t)\)。
    3.  **Critic 更新 (加入重要性权重)**：
        \[
 w_{t+1} = w_t + \alpha_w \frac{\pi(a_t|s_t, \theta_t)}{\beta(a_t|s_t)} \delta_t \nabla_w V(s_t, w_t) 
\]
    4.  **Actor 更新 (加入重要性权重)**：
        \[
 \theta_{t+1} = \theta_t + \alpha_\theta \frac{\pi(a_t|s_t, \theta_t)}{\beta(a_t|s_t)} \delta_t \nabla_\theta \ln \pi(a_t|s_t, \theta_t) 
\]
**已知 vs 未知量**
*   🟢 **已知量**：
    *   行为策略 \(\beta(a_t|s_t)\) 产生的一组真实经验数据：\(s_t, a_t, r_{t+1}, s_{t+1}\)。
    *   当前网络的参数 \(w_t\) 和 \(\theta_t\)。
    *   前向传播算出的价值 \(V(s_t, w_t)\) 和 \(V(s_{t+1}, w_t)\)。
    *   网络输出的概率 \(\pi(a_t|s_t, \theta_t)\) 和 \(\beta(a_t|s_t)\)。
    *   反向传播算出的梯度 \(\nabla_w V\) 和 \(\nabla_\theta \ln \pi\)。
*   🔴 **未知量（更新目标）**：
    *   \(w_{t+1}\)：更新后的 Critic 网络参数。
    *   \(\theta_{t+1}\)：更新后的 Actor 网络参数。
   --- 
## 五、 确定性策略梯度
### 1.核心思想：处理连续动作
目前的策略梯度方法使用的都是随机策略（即 \(\pi(a|s, \theta) > 0\)）。但在处理连续动作时，输出概率分布太慢。因此引入**确定性策略 (Deterministic policy)**，直接输出确定的动作：
\[
 a = \mu(s, \theta) 
\]

**目标函数**
\[
 J(\theta) = \mathbb{E}[V_\mu(s)] = \sum_{s \in S} d_0(s) V_\mu(s) \quad \text{其中 } \sum_{s \in S} d_0(s) = 1 
\]
*   \(d_0\) 的选取与 \(\mu\) 无关。有两种特殊选取：① 只关注固定起点（\(d_0(s_0)=1\)）；② \(d_0\) 是某个行为策略下的平稳分布。

**DPG 定理 (折扣情况下的确定性策略梯度)**
当 \(\gamma \in (0,1)\) 时，目标函数 \(J(\theta)\) 的梯度为：
\[
 \nabla_\theta J(\theta) = \sum_{s \in S} \rho_\mu(s) \nabla_\theta \mu(s) \big(\nabla_a q_\mu(s,a)\big)\big|_{a=\mu(s)} 
\]
写成期望形式：
\[
 \nabla_\theta J(\theta) = \mathbb{E}_{s \sim \rho_\mu} \left[ \nabla_\theta \mu(s) \big(\nabla_a q_\mu(s,a)\big)\big|_{a=\mu(s)} \right] 
\]
*   **核心分析**：注意看，**这个梯度不包含动作 \(A\) 的分布**。因为动作是确定的，所以它天生就是 **Off-policy** 的！

**Deterministic Actor-Critic 算法流程 (Off-policy)**
*   **初始化**：给定行为策略 \(\beta(a|s)\)（用于探索），确定性的目标策略 \(\mu(s, \theta_0)\)，以及价值函数网络 \(Q(s, a, w_0)\)。
*   **每一步迭代 (Time step \(t\))**：
    1.  在行为策略 \(\beta\) 下生成动作 \(a_t\)，观测到 \(r_{t+1}, s_{t+1}\)。
    2.  **计算 TD Error**：
        \[
 \delta_t = r_{t+1} + \gamma Q(s_{t+1}, \mu(s_{t+1}, \theta_t), w_t) - Q(s_t, a_t, w_t) 
\]
    3.  **Critic 更新 (Value update)**：
        \[
 w_{t+1} = w_t + \alpha_w \delta_t \nabla_w Q(s_t, a_t, w_t) 
\]
    4.  **Actor 更新 (Policy update)**：
        \[
 \theta_{t+1} = \theta_t + \alpha_\theta \nabla_\theta \mu(s_t, \theta_t) \big(\nabla_a Q(s_t, a, w_{t+1})\big)\big|_{a=\mu(s_t)} 
\]

**已知 vs 未知量**
*   🟢 **已知量**：
    *   交互数据 \(s_t, a_t, r_{t+1}, s_{t+1}\)（其中动作 \(a_t\) 是由行为策略 \(\beta\) 生成的）。
    *   当前网络参数 \(w_t, \theta_t\)。
    *   网络输出的动作 \(\mu(s_t, \theta_t)\) 及价值 \(Q(\dots)\)。
    *   反向传播算出的梯度 \(\nabla_w Q\)、\(\nabla_\theta \mu\) 以及 \(\nabla_a Q\)。
*   🔴 **未知量（公式求解目标）**：
    *   \(w_{t+1}\)：更新后的 Critic 参数。
    *   \(\theta_{t+1}\)：更新后的 Actor 参数。

*   **注**：行为策略 \(\beta\) 与目标策略 \(\mu\) 不同，\(\beta\) 通常用 \(\mu + \text{noise}\) 替代（加入噪声保证探索）。
*   关于 \(Q(s, a, w)\) 的选取：
    ① **线性**拟合：\(Q(s, a, w) = \phi^T(s, a)w\) （这是纯 DPG）。
    ② **神经网络**拟合：这就是 **DDPG (Deep Deterministic Policy Gradient)**。`   