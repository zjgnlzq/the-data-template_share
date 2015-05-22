# jsonnet简介


jsonnet是Google开源了用于增强json的语言。它完全向后兼容并加入了一些新特性：注释、引用、算术运算、条件操作符，数组和对象，引入函数，局部变量，继承等。


## 基本特新

* key的双引号不是必须的

* 对象和数组最后一个属性后面可以有逗号

* 支持单行或多行注释

```
/* bar_menu.1.jsonnet */
{   // key可以不加双引号
    cocktails: {
        "Tom Collins": {
        	/* 对象和数组最后一项后面可以有逗号 */
            ingredients: [
                { kind: "Farmers Gin", qty: 1.5 },
                { kind: "Lemon", qty: 1 },
                { kind: "Simple Syrup", qty: 0.5 },
                { kind: "Soda", qty: 2 },
                { kind: "Angostura", qty: "dash", }, 
            ],
            garnish: "Maraschino Cherry",
            served: "Tall",
        },
        Manhattan: {
            ingredients: [
                { kind: "Rye", qty: 2.5 },
                { kind: "Sweet Red Vermouth", qty: 1 },
                { kind: "Angostura", qty: "dash" },
            ],
            garnish: "Maraschino Cherry",
            served: "Straight Up",
        },
    }
}
```

## 引用

self: 当前对象

$:根对象

```
// bar_menu.2.jsonnet
{
    cocktails: {
        "Tom Collins": {
            ingredients: [
                { kind: "Farmers Gin", qty: 1.5 },
                { kind: "Lemon", qty: 1 },
                { kind: "Simple Syrup", qty: 0.5 },
                { kind: "Soda", qty: 2 },
                { kind: "Angostura", qty: "dash" },
            ],  
            garnish: "Maraschino Cherry",
            served: "Tall",
        },  
        Martini: {
            ingredients: [
                {
                    kind: $.cocktails["Tom Collins"].ingredients[0].kind, // $引用根对象
                    qty: 1
                },
                { kind: "Dry White Vermouth", qty: 1 },
            ],
            garnish: "Olive",
            served: "Straight Up",
        },
        "Gin Martini": self.Martini, // self引用当前对象
    }   
} 
```

## 操作数据，支持常用的算术与逻辑运算符

+: 数组（拼接）、字符串（连结）、对象（溶化）

```
// bar_menu.3.jsonnet
{
    foo: 3,     
    bar: 2 * self.foo,  // 乘法运算.
    baz: "The value " + self.bar + " is "
         + (if self.bar > 5 then "large" else "small") + ".", // 字符串（连结）
    array: [1, 2, 3] + [4],  // 数组（拼接）
    obj: {a: 1, b: 2} + {b: 3, c: 4}, // 对象（溶化）
    equality: 1 == "1",
}

```

## 数组和对象深入

```
// example_operators.jsonnet
{
    foo: [1, 2, 3],
    bar: [x * x for x in self.foo if x >= 2],  // for
    baz: { ["field" + x]: x for x in self.foo }, // 表达式 属性
    obj: { ["foo" + "bar"]: 3 },
}
```
=================

## 模块化

项目配置文件过大，或数据文件过大，需要拆分，通过import引入

```
// martinis.jsonnet
	{
	    "Vodka Martini": {
	        ingredients: [
	            { kind: "Vodka", qty: 2 },
	            { kind: "Dry White Vermouth", qty: 1 },
	        ],
	        garnish: "Olive",
	        served: "Straight Up",
	    },
	    Cosmopolitan: {
	        ingredients: [
	            { kind: "Vodka", qty: 2 },
	            { kind: "Triple Sec", qty: 0.5 },
	            { kind: "Cranberry Juice", qty: 0.75 },
	            { kind: "Lime Juice", qty: 0.5 },
	        ],
	        garnish: "Orange Peel",
	        served: "Straight Up",
	    },
	}

	// bar_menu.6.jsonnet
	{
	    cocktails: import "martinis.jsonnet" + { // 引入上面的martinis.jsonnet文件
	        Manhattan: {
	            ingredients: [
	                { kind: "Rye", qty: 2.5 },
	                { kind: "Sweet Red Vermouth", qty: 1 },
	                { kind: "Angostura", qty: "dash" },
	            ],
	            garnish: "Maraschino Cherry",
	            served: "Straight Up",
	        },
	        Cosmopolitan: {
	            ingredients: [
	                { kind: "Vodka", qty: 1.5 },
	                { kind: "Cointreau", qty: 1 },
	                { kind: "Cranberry Juice", qty: 2 },
	                { kind: "Lime Juice", qty: 1 },
	            ],
	            garnish: "Lime Wheel",
	            served: "Straight Up",
	        },
	    }
	}
```

## 函数与变量

```
// bar_menu_utils.jsonnet
{
	// equal_parts 函数
    equal_parts(size, ingredients)::
        if std.length(ingredients) == 0 then
            error "No ingredients specified."
        else [
            { kind: i, qty: size/std.length(ingredients) }
            for i in ingredients
        ],
    id:: function(x) x,
}

// bar_menu.7.jsonnet
local utils = import "bar_menu_utils.jsonnet"; // 变量
{
    local my_gin = "Farmers Gin", // 变量
    cocktails: {
        "Bee's Knees": {
            // Divide 4oz among the 3 ingredients.
            ingredients: utils.equal_parts(4, [
                "Honey Syrup", "Lemon Juice", my_gin]),
            garnish: "Lemon Twist",
            served: "Straight Up",
        },
        Negroni: {
            // Divide 3oz among the 3 ingredients.
            ingredients: utils.equal_parts(3, [
                my_gin, "Sweet Red Vermouth",
                "Campari"]),
            garnish: "Orange Peel",
            served: "On The Rocks",
        },
    }   
} 
```

## 面向对象--继承

{supper2} + {supper1} + {self}

```
// bar_menu.9.jsonnet
{
    cocktails: {
        "Whiskey Sour": {
            ingredients: [
                { kind: "Bourbon", qty: 1.5 },
                { kind: "Lemon Juice", qty: 1 },
                { kind: "Gomme Syrup", qty: 0.5 },
            ],
            garnish: "Lemon Peel",
            served: "Straight Up",
        },
        "Whiskey Sour With Egg": self["Whiskey Sour"] + {
            ingredients: super.ingredients
                         + [ { kind: "Egg White", qty: 0.5 } ],
        },
    }
}
```