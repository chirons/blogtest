/***
 *@desc 自己写分页组件
 *@author chiron
 *@time 2016-11-14 11:37:25
 *@version 0.1
 */
function pager(currpage, pagesize, hasnext, haspre){
    if(currpage){this.currpage = currpage;}else{this.currpage = 1;}
    if(!pagesize){this.pagesize = 10;}else {this.pagesize = pagesize;}
    if(!hasnext){this.hasnext = false;}else{this.hasnext = hasnext;}
    if(!haspre){this.haspre = false;}else{this.haspre = haspre;}
    //pagevent : 'next',//分页事件：有next（下一页）、pre（上一页）、number(数字)、last(最后一页)、first(第一页)等
};

pager.prototype.initload = function()
{

};

pager.prototype.nextpage = function(callback){
    if(!this.currpage)
    {
        this.currpage = 1;
    }
    this.currpage += 1;

    $.post('/report').done(function(data){

    });

    callback();
};

pager.prototype.prepage = function(callback){
    if(!this.currpage)
    {
        this.currpage = 1;
    }
    this.currpage -= 1;

    callback();
};

pager.prototype.topageX = function(index, callback){
    this.currpage = index;
};

