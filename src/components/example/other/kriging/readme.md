kriging_API_method-

方法1：kriging.train-样本训练
kriging.train(t, x, y, model, sigma2, alpha)
t : 代表需要进行插值的权重字段（数组）
x : X轴坐标 （数组）
y : Y轴坐标 （数组）
model : 模型 gaussian、exponential、spherical
sigma2 : 高斯过程的方差参数，常设置为0
alpha :透明度，常设置为100

方法2：kriging.grid-网格矩阵（生成插值网格）
polygons : 格网剪裁的边界
variogram : 上步生成的变异函数
width : 格网宽度

方法3：kriging.plot-在dom上绘图（将grid绘制在canvas上）
kriging.plot(canvas,grid,xlim,ylim,colors)
canvas : canvas dom 元素
grid : 上部创建的格网
xlim : X轴长度
ylim : Y轴长度
color: 颜色数组，例如：["#9900FF", "#0500FF", "#00FFF3", "#00FF28", "#F3FF00", "#FF9E00", "#FF0000"]

方法4：kriging.predicte-模型预测（当前位置的预测值）
kriging.predict(xnew, ynew, variogram)
xnew: X坐标
ynew: Y坐标
variogram: 变异函数

方法5：kriging.variance-模型预测2
kriging.variance(x, y, variogram)

方法6：kriging.contour-轮廓路径
kriging.contour(value, polygons, variogram)
