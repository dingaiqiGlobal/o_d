/**
 * if多重条件判断
 * 1.普通：通常多个条件中只要有一个满足，会使用||(或)运算符
 * 2.语法糖：使用更简洁的语法Array.includes()
 */

import { arraySame } from "./utils1";

//普通
let x = 'abc';
if (x === 'abc' || x === 'def' || x === 'ghi' || x === 'jkl') {
    //代码块
}
//语法糖
let x = 'abc';
if (['abc', 'def', 'ghi', 'jkl'].includes(x)) {
    //代码块
}



/**
 * 比较结果的返回
 * 在return语句中，也可以使用||(或)运算符
 */
//普通
let test;
function fn2() {
    console.log(1);
}
function fn() {
    if (!(test === undefined)) {
        return test
    } else {
        return fn2()
    }
}
fn()
//语法糖
let test;
function fn2() {
    console.log(1);
}
function fn() {
    return test || fn2()
}
fn()



/**
 * if...else的缩写法
 * 当if-else条件中的逻辑比较简单时，可以使用三元条件运算符
 */
//普通
let flag;
let x = 20;
if (x > 10) {
    flag = true;
} else {
    flag = false;
}
//语法糖
let x = 20;
let flag = x > 10 ? true : false;//方式1
let flag = x > 10;//方式2



/**
 * 如果某个变量为true时调用一个函数或返回某个值
 * 可以使用&&运算符，常用于判断兼容问题
 */
//普通
let test1 = true;
function fn() { }
if (test1) { //test1为真，调用fn函数
    fn()
}
//语法糖
let test1 = true;
function fn() { }
test1 && fn()//test1为真，调用fn函数


/**
 * switch对应的缩写法
 * 可以把条件值保存在名值对中，基于这个条件使用名值对代替switch
 */
//普通
function test1() {
    console.log('test1');
}
function test2() {
    console.log('test2');
}
function test() {
    console.log('test');
}
var n = 1;
switch (n) {
    case 1:
        test1();
        break;
    case 2:
        test2();
        break;
    case 3:
        test();
        break;
}
//语法糖
function test1() {
    console.log('test1');
}
function test2() {
    console.log('test2');
}
function test() {
    console.log('test');
}
var n = 1;
var data = {
    1: test1,
    2: test2,
    3: test,
}
data[n] && data[n]();//存在并且执行函数



/**
 * 查询条件缩写法
 * 如果要检查类型，并根据类型调用不同的函数，既可以使用多个else if语句，
 * 也可以使用switch，除此之外，还可以运用对象方式
 */
//普通
var type = 'test1'
if (type === 'test1') {
    test1();
} else if (type === 'test2') {
    test2();
} else if (type === 'test3') {
    test3()
} else if (type === 'test4') {
    test4()
} else {
    test()
}
//语法糖
var type = 'test1'
var types = {
    test1: test1,
    test2: test2,
    test3: test3,
    test4: test4,
};
var func = types[typpe];
func ? func() : test();




/**
 * 逻辑位运算符：位与（&）、位或（|）、位异或（^）、非位（~）
 * 移位运算符：左移（<<）、右移（>>）、无符号右移（>>>）
 *
 * 非位（~）和indexOf缩写法
 * 以查找特定值为目的迭代一个数组（字符串），通常用indexOf方法
 */
//普通
if (arr.indexOf(item) > -1) {
    //找到item
}
if (arr.indexOf(item) === 1) {
    //未找到item
}
//语法糖
if (~arr.indexOf(item)) {
    //找到item
}
if (!~arr.indexOf(item)) {
    //未找到item
}



/**
 * 判断参数及参数属性存在，如果存在就往下执行
 * 语法糖：判断参数及参数属性不存在，就直接return
 */
//普通
function handleFun(event) {
    if (event) {
        const target = event.target;
        if (target) {
            //代码块
        }
    }
}
//语法糖
function handleFun(event) {
    if (!event || !event.target) {
        return;
    }
    //...
}



/**
 * ??（空值合并操作符）---当左侧值为 null 或 undefined 时，返回 ?? 符号右边的值
 * ?.（可选链操作符）---允许读取位于连接对象链深处的属性的值，而不必明确验证链中的每个引用是否有效
 * 
 * 需要用或运算符，来判断前面的值为true的时候返回前面的值，为false的时候返回右边的值
 * 更好的做法用空值合并操作符，来判断前面的值为null和undefined的时候，返回右侧的值
 * 
 * 需要用&&运算符进行非空判断
 * 更好用链操作符简洁（必须是一个链）
 */
const value = reponse.data.text || 'hello';
const value = reponse.data.text ?? 'hello';

const value = reponse && response.data && response.data.text;
const value = reponse?.data?.text;



/**
 * 函数的默认参数es6,函数的参数不要超过三个
 */
//普通
function test(name) {
    const user = name || 'zhangsan';
}
//语法糖
function test(name = 'zhangsan') {

}



/**
 * 给对象参数设置默认值
 */
//普通
const menuConfig = { title: null, boby: 'Bar', buttonText: null };
function createMenu(config) {
    config.title = config.title || 'Foo';
    config.body = config.body || 'Bar';
    config.buttonText = config.buttonText || 'Baz';
}
createMenu(menuConfig)
//语法糖(将所有源对象的所有属性复制到目标对象上,并且返回目标对象)
const menuConfig = { title: 'Order', buttonText: 'Send' };//menuConfig中没有body属性
function createMenu(config) {
    config = Object.assign(
        { title: 'Foo', boby: 'Bar', buttonText: 'Baz' },
        config
    )
    //config：{title: 'Order'，boby: 'Bar'，buttonText: 'Send'}
}
createMenu(menuConfig)
