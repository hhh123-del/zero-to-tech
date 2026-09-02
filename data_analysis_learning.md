# 1.1 Excel基础函数&格式操作
### 查找匹配
- `XLOOKUP(查找值,查找区域,返回区域,[未找到值],[匹配模式])`
- `VLOOKUP(查找值,数据表,返回列号,匹配类型)`

### 条件统计
- `SUMIF(条件区域,条件,求和区域)`
- `SUMIFS(求和区域,条件区1,条件1,条件区2,条件2…)`
- `COUNTIF(条件区域,条件)`
- `COUNTIFS(条件区1,条件1,条件区2,条件2…)`

### 逻辑&容错
- `IF(条件,真,假)`
- `IFS(条件1,结果1,条件2,结果2,…,TRUE,兜底)`
- `IFERROR(表达式,错误返回值)`
- `AND(条件1,条件2)`
- `OR(条件1,条件2)`

### 日期
- `TODAY()` 获取当前日期
- `YEAR() / MONTH() / DAY()` 提取年、月、日
- `DATEDIF(开始,结束,"D/M/Y")` 计算时间间隔
- `EOMONTH(日期,0)` 获取当月最后一天

### 文本处理
- `&` 文本连接：`A1&B1`
- `CONCAT(区域)` 拼接区域文本
- `TEXT(值,"格式")` 数字转指定格式文本

### 引用规则
- 相对引用：`A1`，拖动公式行列同步变化
- 绝对引用：`$A$1`，拖动固定不变
- 混合引用：`$A1`固定列；`A$1`固定行

### GETPIVOTDATA（透视表取值）
- 作用：按**字段文字条件**提取透视表数值，透视表调整布局后，取值不会错乱；普通单元格引用会因为表格移位出错
- 语法：`=GETPIVOTDATA("汇总字段名",透视表内单元格,字段1,条件1,字段2,条件2…)`
- 快速实操：空白单元格输入`=`，直接鼠标点击透视表里面的数字，自动生成完整公式，不用手动敲
- 示例：`=IFERROR(GETPIVOTDATA("求和项:成交金额",$B$3,"区域","华西北","业务组","重庆一组"),0)`
- 注意：第二个参数建议加`$`绝对引用；找不到数据会报错，搭配`IFERROR`兜底返回0

### 业务指标
- 占比：`单元格/总和单元格`
- 环比：`(本期‑上期)/上期`，配合`IFERROR`处理除零

### 格式&筛选
1. **条件格式**
- 标记重复值：开始→条件格式→突出显示单元格规则→重复值
- 色阶、数据条：快速做数值可视化
2. **筛选**：表头开启筛选，按文本/数字/日期过滤数据

### 数据透视表
- 用户分层统计、多维度汇总、时间趋势聚合、交叉维度分析
>注意：透视表的重复标签不是合并单元格，**不能做拆分单元格操作**；如需手动编辑，复制后选择性粘贴为【值】转为普通表格。


# 1.2 PowerQuery M语言
M三大核心容器：**Table(表)、List(列表)、Record(记录)**

## Table 表
### 容器互相转换
- 表 ➜ 列表：`Table.ToList(表)`
- 表 ➜ 记录（取第一行）：`Table.ToRecord(表)`
- 表 ➜ 列集合：`Table.ToColumns(表)`
- 表 ➜ 行集合：`Table.ToRows(表)`
- 列表 ➜ 表：`Table.FromList(列表)`
- 记录集合 ➜ 表：`Table.FromRecords({记录1,记录2})`
- 行集合转为表：`Table.FromRows(行列表,{"列1","列2"})`
- 列集合转为表：`Table.FromColumns({列列表},{"列1","列2"})`

### 获取元素
- 获取整列：`表[列名]`
- 获取第N行记录(索引从0开始)：`表{行号}`
- 获取单元格：`表{行号}[列名]`

### 表操作函数
- 筛选行：`Table.SelectRows(表, each ...)`
- 删除重复：`Table.Distinct(表,{"列1","列2"})`
- 删除空值行：`Table.RemoveRowsWithNull(表)`
- 添加计算列：`Table.AddColumn(表,"新列名", each ...)`
- 删除列：`Table.RemoveColumns(表,{"列名"})`
- 排序：`Table.Sort(表,{{"列名",Order.Ascending}})`
- 多表合并：`Table.Combine({表1,表2})`
- 分组聚合：`Table.Group(表,{"分组字段"},{{"输出列",each 聚合(_)}})`
- 跳过表前N行：`Table.Skip(表, 行数)`

## List 列表
### 容器互相转换
- 列表 ➜ 表：`Table.FromList(列表)`
- 列表 ➜ 记录：`Record.FromList(列表,{"字段1","字段2"})`
- 记录 ➜ 列表：`Record.ToList(记录)`
- 表 ➜ 列表：`Table.ToList(表)`

### 获取元素
- 按索引取元素（索引0开始）：`列表{索引}`

### 列表操作函数
- 求和：`List.Sum(列表)`
- 计数：`List.Count(列表)`
- 平均：`List.Average(列表)`
- 最大：`List.Max(列表)`
- 最小：`List.Min(列表)`
- 遍历转换：`List.Transform(列表, each ...)`
- 单条件筛选：`List.Select(列表, each ...)`
- 多条件筛选：`List.Select(列表, each 条件1 and 条件2)`
- 文本筛选：`List.Select(列表, each Text.Contains(_,"关键词"))`
- 删除空值：`List.RemoveNulls(列表)`
- 列表排序：`List.Sort(列表, Order.Ascending)`

## Record 记录（键值对）
### 容器互相转换
- 记录 ➜ 表：`Table.FromRecords({记录})`
- 记录 ➜ 列表：`Record.ToList(记录)`
- 列表 ➜ 记录：`Record.FromList(列表,{"字段1","字段2"})`
- 表第一行 ➜ 记录：`Table.ToRecord(表)`

### 获取元素
- 简写取值：`记录[字段名]`
- 函数取值：`Record.Field(记录,"字段名")`

## 通用语法（不属于某一个容器）
### 条件语句
```powerquery
if 条件 then 结果1 else 结果2
```

### 容错语句
```powerquery
try 表达式 otherwise 出错返回值
```

### 文本处理函数
- 左侧提取： Text.Start(文本,提取字符数) 
- 右侧提取： Text.End(文本,提取字符数) 
- 中间截取： Text.Middle(文本,起始位置,截取长度) 
- 文本合并： Text.Combine(列表,"分隔符") 
- 文本分割： Text.Split(文本,"分隔符") 
- 判断包含： Text.Contains(文本,"关键词") 
- 文本转日期： Date.From(文本) 

### 多sheet表合并
```powerquery
//①单个Excel文件内部所有sheet合并
Source = Excel.Workbook(File.Contents("文件路径")),
CombineSheets = Table.Combine(Source[Data])

//②文件夹下多个Excel，读取每个文件第一个sheet并合并
FileList = Folder.Files("文件夹路径"),
TableList = List.Transform(FileList[Content], each Excel.Workbook(_,true)[Data]{0}),
CombineAll = Table.Combine(TableList)
```

# 1.3 python数据清洗基本语法
## 自动化合并表

### 多个Excel合并
```python
#用于合并文件夹下的所有Excel表的包，要有文件夹的地址和保存的地址两个个选项
import pandas as pd#先读大文件夹的所有Excel表，
import os#用于读取文件
def concat_data(floder_path,save_path):
    all_dfs=[]
    for file in os.listdir(floder_path):#检查大文件夹下的所有文件
        if file.endswith("订单数据.xlsx"):#检查文件结尾名字是否为xlsx
            file_path=os.path.join(floder_path,file)#拼接文件路径，大文件地址加上小文件地址
            df=pd.read_excel(file_path)#读取当前Excel，读取完所有之后会形成为一个列表
            all_dfs.append(df)
            print(f'已读取:{file}')
    df_final=pd.concat(all_dfs,ignore_index=True)#合并所有表格
    df_final.to_excel(rf"{save_path}\用循环合并.xlsx", index=False)
    print('合并完成')
```
### 多文件夹合并
```pyhthon
# 合并多个文件夹下所有excel文件
import pandas as pd
import os
import glob
def concat_data(floder_path,save_path)
    all_dfs=[]
    for files in os.listdir(floder_path):
        if files.startswith("2025-"):
           files_path=os.path.join(floder_path,files)#形成的是订单数据后的大文件夹
           for file in os.listdir(files_path):#检查大文件夹下的所有文件
              if file.endswith(".xlsx"):#检查文件结尾名字是否为xlsx
                file_path=os.path.join(files_path,file)#拼接文件路径，大文件地址加上小文件地址
                df=pd.read_excel(file_path)#读取当前Excel，读取完所有之后会形成为一个列表
                all_dfs.append(df)
                print(f'已读取:{file}')      
    df_final=pd.concat(all_dfs,ignore_index=True)#合并所有表格
    df_final.to_excel(rf"(save_path)\自动化合并结果.xlsx", index=False)
    print('合并完成')  
```

## 数据清洗常用语法
```python
#导入常用的数据清洗库
import pandas as pd
import numpy as np
```
### 读取文件
```python
pd.read_excel(skiprows=【跳过行数】, usecols=【需要读取的列列表】, index_col=【设为索引的列】, dtype={【列名:数据类型】})
pd.read_csv(【文件路径】, encoding=【编码格式】)
```

### 查看数据
```python
df.shape
df.info()
df.describe()
df.head(【显示行数】)
```

### 缺失值处理 
```python
df.isnull()
df.isnull().sum()
df.isnull().mean().round(2)

df.dropna()
df.dropna(subset=[【要检查的列】])
df.dropna(axis=1, thresh=len(df)*0.5)

df[【列名】].fillna(df[【列名】].mean())
df[【列名】].fillna("未知")
df.fillna({【列名】:填充值})

df[【列名】].ffill()
df[【列名】].bfill()
df[【列名】].interpolate(method="linear")
```
### 重复值处理 
```python
df.duplicated()
df.duplicated(subset=[【指定列】])
df.duplicated().sum()

df.drop_duplicates(subset=[【指定列】])
df.drop_duplicates(subset=[【指定列】], keep="last")
```
### 数据类型转换 
```python
df[【列名】].astype(【目标类型】)
pd.to_numeric(df[【列名】], errors="coerce")

pd.to_datetime(df[【列名】], infer_datetime_format=True)
pd.to_datetime(df[【列名】], format=【日期格式字符串】, errors="coerce")

df[【日期列】].dt.year
df[【日期列】].dt.month
df[【日期列】].dt.day_name()
```

### 字符串清洗 
```python
df[【字符串列】].str.strip()
df[【字符串列】].str.lower()
df[【字符串列】].str.upper()

df[【字符串列】].str.replace(【旧字符串】, 【新字符串】, regex=True)
df[【字符串列】].str.contains(【匹配字符串】, regex=True)

df[【字符串列】].str.split(【分隔符】, expand=True)
df[【字符串列】].str.extract(【正则表达式】)
```
### 列与索引操作 
```python
df.rename(columns={【旧列名】:【新列名】})
df.drop(columns=[【要删除的列】])
df.drop(index=[【要删除的行索引】])
df.dropna(axis=1, how="all")

df.reset_index(drop=True)
df.set_index(【设为索引的列名】)

df.columns = df.columns.str.strip().str.lower().str.replace(" ","_").str.replace(r"[^\w]","",regex=True)
```
### 异常值处理 
```python
df[df[【数值列】].between(【下限】,【上限】)]
df[【数值列】].clip(lower=【下限】, upper=【上限】)
df[【数值列】].clip(upper=df[【数值列】].quantile(0.99))

df[【列名】].value_counts()
df[【列名】].str.lower().replace({【旧值】:【新值】}, np.nan)
```
### 替换、映射、apply
```python 
df.replace([【旧值列表】], np.nan)
df[【列名】].replace({【旧值】:【新值】})

df[【列名】].map({【原值】:【映射值】})

df[【列名】].apply(lambda x: 【自定义逻辑】)
df.apply(【自定义函数】, axis=1)
```
### 数值分箱 
```python
pd.cut(df[【数值列】], bins=[【区间边界】], labels=[【分组标签】], right=True)
pd.qcut(df[【数值列】], q=【分位数数量】, labels=[【分组标签】])
```
### 查看字段种类 
```python
df[【列名】].nunique()
```
### 清洗前的准备 
```python
step1 head()
step2 info()
step3 describe()
step4 value_counts()
step5 drop_duplicates()
```
## 数据可视化常用语法
```python
#导入常用可视化库 
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

#设置全局样式（可选，美化）
# 解决中文显示
plt.rcParams["font.sans-serif"] = ["SimHei"] 
# 解决负号显示 
plt.rcParams["axes.unicode_minus"] = False    
# seaborn画布风格
sns.set_style("whitegrid") 
```
### 创建画布
```python
# 方式1：简单画布（单图）
plt.figure(figsize=(【宽】,【高】), dpi=【分辨率】)

# 方式2：子图画布，多张子图（常用）
fig, axes = plt.subplots(nrows=【行数】, ncols=【列数】, figsize=(【宽】,【高】), dpi=【分辨率】)

# 示例：2行2列画布
fig, axes = plt.subplots(2,2, figsize=(12,8), dpi=100)
```
### 常用统计图
#### 条形图 barplot（均值柱状图，seaborn） 
```python
# 基础
sns.barplot(x=【x列名】, y=【y列名】, data=df, ax=ax)
# 增加分组hue，调色板palette
sns.barplot(x=【x列】, y=【y列】, hue=【分组列】, data=df, palette="Set2", ax=ax)
# 统计：estimator=np.mean 均值；estimator=np.sum求和
sns.barplot(x=【x列】, y=【y列】, estimator=np.sum, data=df, ax=ax)
```

#### 计数条形图 countplot（统计每个类别数量）
```python
sns.countplot(x=【类别列】, hue=【分组列】, data=df, palette="Set1", ax=ax)
```


#### 箱线图 boxplot 
```python
sns.boxplot(x=【x列】, y=【y列】, hue=【分组列】, data=df, palette="Set3", ax=ax)
# 只画一列
sns.boxplot(y=【数值列】, data=df, ax=ax)
# matplotlib
plt.boxplot(df[【数值列】], labels=["标签"])
```
#### 散点图 scatter 
```python
sns.scatterplot(x=【x列】, y=【y列】, hue=【分组列】, size=【大小列】, data=df, ax=ax)

# matplotlib
plt.scatter(df[【x列】], df[【y列】], s=【点大小】, c=【颜色】, alpha=0.6)

#散点图加回归线
sns.regplot=(x=【x列】, y=【y列】, data=df,color="red",scatter=False)
```
#### 热力图 heatmap（相关系数矩阵） 
```python
# 第一步：求相关系数矩阵
corr_mat = df.corr(numeric_only=True)
# 绘图
sns.heatmap(corr_mat, annot=True, fmt=".2f", cmap="RdBu_r", vmin=-1, vmax=1, ax=ax)
# 参数说明
# annot=True：格子写数字；fmt=".2f"保留2位小数；cmap颜色映射；vmin/vmax颜色范围
```
#### 直方图 
```python
#直方图 hist 分布,kde=True 叠加密度曲线
sns.histplot(df[【数值列】], bins=【分组数量】, kde=True, ax=ax)
# 直方图加中位数竖线
med=df[【数值列】].median()
plt.axvline(x=med,color="red",linestyle="--",label=f"中位数={med:.2f}")
```
#### 小提琴图 violinplot
```python
sns.violinplot(x=【x列】, y=【y列】, hue=【分组列】, data=df, ax=ax)
```
#### 折线图 lineplot 
```python
sns.lineplot(x=【x时间列】, y=【y数值列】, hue=【分组列】, data=df, ax=ax)
```
#### 雷达图（matplotlib，需要预处理） 
```python
# 雷达图需要角度，示例模板
from matplotlib.patches import Circle, RegularPolygon
from matplotlib.path import Path
from matplotlib.projections.polar import PolarAxes
from matplotlib.projections import register_projection
from matplotlib.spines import Spine
from matplotlib.transforms import Affine2D
def radar_factory(num_vars, frame='circle'):
    theta = np.linspace(0, 2*np.pi, num_vars, endpoint=False)
    class RadarAxes(PolarAxes):
        name = 'radar'
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.set_theta_zero_location('N')
        def fill(self, *args, **kwargs):
            return super().fill_between(*args,**kwargs)
        def plot(self, *args, **kwargs):
            lines = super().plot(*args, **kwargs)
            self._close_line(lines[0])
            return lines
        def _close_line(self, line):
            x, y = line.get_data()
            if x[0] != x[-1]:
                x = np.concatenate((x, [x[0]]))
                y = np.concatenate((y, [y[0]]))
                line.set_data(x, y)
        def set_varlabels(self, labels):
            self.set_thetagrids(np.degrees(theta), labels)
    register_projection(RadarAxes)
    return theta
```

```python
#一个例子
theta = radar_factory(5) # 5个维度
fig, ax = plt.figure(figsize=(6,6)), plt.subplot(projection='radar')
data = [【维度1值,维度2值,维度3值,维度4值,维度5值]]
ax.plot(theta, data[0])
ax.fill(theta, data[0], alpha=0.25)
ax.set_varlabels(["维度1","维度2","维度3","维度4","维度5"])
```
### 画布修饰（标题、坐标轴、刻度、图例） 
> ***注意***：如果是子图axes，用 ax.set_xxx()；单图用plt.xxx()

#### 标题
```python
plt.title("【图表大标题】", fontsize=14, pad=15)
ax.set_title("子图标题", fontsize=12)
```
#### x/y轴标签
```python
plt.xlabel("X轴名称", fontsize=11)
plt.ylabel("Y轴名称", fontsize=11)
ax.set_xlabel("X轴名称")
ax.set_ylabel("Y轴名称")
```
#### 坐标轴范围
```python
plt.xlim(【x最小值】,【x最大值】)
plt.ylim(【y最小值】,【y最大值】)
ax.set_xlim(0,100)
```
#### 刻度旋转（防止文字重叠）
```python
plt.xticks(rotation=45) # x轴刻度旋转45度
ax.tick_params(axis="x", rotation=45)
```
#### 图例
```python
plt.legend(loc="upper right") # loc位置：upper left/right
ax.legend(loc="best")
```
#### 网格线
```python
plt.grid(alpha=0.3)
ax.grid(alpha=0.3)
```
#### 紧凑布局，防止标签被截断
```python
plt.tight_layout()
```
#### 图片保存
```python
# 保存图片，必须写在plt.show()之前
plt.savefig("【保存文件名.png】", dpi=300, bbox_inches="tight")
# bbox_inches="tight" 自动裁剪多余空白
plt.show()
```
# 1.4 SQL语法

### 常用语法
```sql
CREATE TABLE 【表名】(
    【字段名1】 【字段类型】,
    【字段名2】 【字段类型】
);
INSERT INTO 【表名】(【字段1】,【字段2】) VALUES (【值1】,【值2】);
DELETE FROM 【表名】 WHERE 【条件】;
SELECT 【字段1】  FROM 【表名】 WHERE 【条件】;
```
### 查询语法
>***查询顺序***：select→ over() → from → where → group by → having → order by → limit 
***执行顺序***：from → where → group by → having → select → over()→ order by → limit  
```sql
-- 基础查询
SELECT 【字段1】,【字段2】 FROM 【表名】;

-- 查询所有列
SELECT * FROM 【表名】;

-- 去重
SELECT DISTINCT 【字段】 FROM 【表名】;

-- 别名
SELECT 【字段】 AS 【别名】 FROM 【表名】;

-- 条件过滤 where
SELECT 【字段】 FROM 【表名】 WHERE 【条件】;

-- 模糊查询 like
-- % 匹配任意多个字符；_匹配单个字符
SELECT * FROM 【表名】 WHERE 【字段】 LIKE '%关键词%';

-- 多条件 and / or
SELECT * FROM 【表名】 WHERE 【条件1】 AND 【条件2】;
SELECT * FROM 【表名】 WHERE 【条件1】 OR 【条件2】;

-- 范围
SELECT * FROM 【表名】 WHERE 【字段】 IN (值1,值2,值3);
SELECT * FROM 【表名】 WHERE 【字段】 BETWEEN 【下限】 AND 【上限】;

-- 排序 order by
SELECT * FROM 【表名】 ORDER BY 【字段】 ASC;  -- ASC升序(默认)
SELECT * FROM 【表名】 ORDER BY 【字段】 DESC; -- DESC降序

-- 分页 limit
SELECT * FROM 【表名】 LIMIT 【n】; --取前n条
SELECT * FROM 【表名】 LIMIT 【偏移量】,【条数】; --从偏移量+1开始取n条

-- 分组聚合 group by + having
-- 聚合函数：sum() count() avg() max() min()
SELECT 【分组字段】, SUM(【数值字段】) FROM 【表名】 GROUP BY 【分组字段】;

-- having：分组之后做过滤（可以用聚合函数；where是分组前过滤）
SELECT 【分组字段】, AVG(【字段】) AS avg_val 
FROM 【表名】 
GROUP BY 【分组字段】
HAVING AVG(【字段】) > 【阈值】;
```
### 多表连接 JOIN 
```sql
-- 内连接 inner join：只保留两边匹配的数据
SELECT 【字段】 
FROM 【表1】
INNER JOIN 【表2】 ON 【表1.字段】 = 【表2.字段】;

-- 左连接 left join：保留左表全部，右表匹配不到为null
SELECT 【字段】
FROM 【表1】
LEFT JOIN 【表2】 ON 【表1.字段】 = 【表2.字段】;

-- 右连接 right join：保留右表全部，左表匹配不到为null
SELECT 【字段】
FROM 【表1】
RIGHT JOIN 【表2】 ON 【表1.字段】 = 【表2.字段】;
```
### 常用函数

#### 数值函数
```sql
ROUND(【数值】,【保留小数位数])   --四舍五入
-- 示例 ROUND(13.15,1) →13.2
```
#### 字符串函数
```sql
CONCAT(s1,s2,...)        --拼接字符串
REPLACE(s,old,new)      --替换字符串
LEFT(s,n)               --取左边n位
RIGHT(s,n)              --取右边n位
SUBSTRING(s,start,len)  --截取字符串
```
#### 类型转换
```sql
CAST(【字段】 AS 【类型】)
--类型：CHAR(n)、DATE、DATETIME、DECIMAL
```
#### 条件判断
```sql
IF(表达式,真值,假值)
CASE 
    WHEN 条件1 THEN 返回值1
    WHEN 条件2 THEN 返回值2
    ELSE 默认值
END
```
#### 日期函数
```sql
YEAR(日期)        --取年
MONTH(日期)       --取月
DAY(日期)         --取日
WEEKDAY(日期)     --星期（0=周一）
DATE_DIFF(date1,date2) --两个日期差值
TIMESTAMPDIFF(单位,开始时间,结束时间)
--单位：second/minute/hour/day/week/month/year

DATE_ADD(日期,INTERVAL 数值 单位) --日期加
DATE_SUB(日期,INTERVAL 数值 单位) --日期减

DATE_FORMAT(日期,格式) --日期格式化
--格式符：%Y年 %m月 %d日 %H(24小时) %i分钟 %s秒
```
### 窗口函数（over()） 
- 窗口函数：不会合并行，保留原始每一行；over()定义窗口范围
- 语法：函数() OVER(PARTITION BY 【分组字段】 ORDER BY 【排序字段】)

#### 排序窗口函数
```sql
RANK()        --跳跃排名，并列跳号（1,2,2,4）
DENSE_RANK()  --并列不跳号（1,2,2,3）
ROW_NUMBER()  --连续编号（1,2,3,4）
```
#### 偏移函数
```sql
LAG(字段,偏移量,默认值)  --向上取前N行
LEAD(字段,偏移量,默认值) --向下取后N行
```
>***示例***：分组内排名
SELECT 
    【字段】,
    RANK() OVER(PARTITION BY 【分组字段】 ORDER BY 【排序字段】 DESC) AS rk
FROM 【表名】;


