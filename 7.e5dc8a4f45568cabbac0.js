(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{YanU:function(t,n,s){"use strict";s.r(n),s.d(n,"PostsModule",function(){return j});var e=s("ofXK"),i=s("3Pt+"),c=s("tyNb"),o=s("fXoL"),a=s("dJ3e");function b(t,n){if(1&t){const t=o.Nb();o.Mb(0,"button",2),o.Tb("click",function(){return o.dc(t),o.Vb().handleAddPost()}),o.ic(1),o.Lb()}if(2&t){const t=n.ngIf;o.Yb("disabled",t.isLoading),o.zb(1),o.kc(" ",t.isLoading?"Adding...":"Add Post"," ")}}let l=(()=>{class t{constructor(){this.postFormControl=new i.b(""),this.addPostMutation=Object(a.c)()}handleAddPost(){this.addPostMutation.dispatch({name:this.postFormControl.value})}}return t.\u0275fac=function(n){return new(n||t)},t.\u0275cmp=o.Db({type:t,selectors:[["app-new-post"]],decls:3,vars:4,consts:[["placeholder","New post name","type","text",3,"formControl"],["class","m-4 btn btn-primary",3,"disabled","click",4,"ngIf"],[1,"m-4","btn","btn-primary",3,"disabled","click"]],template:function(t,n){1&t&&(o.Kb(0,"input",0),o.gc(1,b,2,2,"button",1),o.Wb(2,"async")),2&t&&(o.Yb("formControl",n.postFormControl),o.zb(1),o.Yb("ngIf",o.Xb(2,2,n.addPostMutation.state$)))},directives:[i.a,i.e,i.c,e.k],pipes:[e.b],encapsulation:2,changeDetection:0}),t})();var r=s("5VZZ");function u(t,n){1&t&&(o.Mb(0,"small"),o.ic(1,"Loading..."),o.Lb())}const d=function(t){return["/posts",t]};function p(t,n){if(1&t&&(o.Mb(0,"li"),o.Mb(1,"a",6),o.ic(2),o.Lb(),o.Lb()),2&t){const t=n.$implicit;o.zb(1),o.Yb("routerLink",o.ac(2,d,t.id)),o.zb(1),o.jc(t.name)}}function f(t,n){if(1&t&&(o.Mb(0,"div"),o.gc(1,p,3,4,"li",5),o.Lb()),2&t){const t=o.Vb().ngIf,n=o.Vb();o.zb(1),o.Yb("ngForOf",null==t?null:t.data)("ngForTrackBy",n.trackByFn)}}function g(t,n){1&t&&(o.Mb(0,"p",7),o.ic(1,"No posts :("),o.Lb())}function m(t,n){if(1&t&&(o.Mb(0,"section",1),o.gc(1,u,2,0,"small",2),o.gc(2,f,2,2,"div",3),o.gc(3,g,2,0,"ng-template",null,4,o.hc),o.Lb()),2&t){const t=n.ngIf,s=o.cc(4);o.zb(1),o.Yb("ngIf",t.isLoading),o.zb(1),o.Yb("ngIf",null==t||null==t.data?null:t.data.length)("ngIfElse",s)}}let h=(()=>{class t{constructor(){this.postsQuery$=Object(r.e)()}trackByFn(t,n){return n.id}}return t.\u0275fac=function(n){return new(n||t)},t.\u0275cmp=o.Db({type:t,selectors:[["app-posts-list"]],decls:2,vars:3,consts:[["class","space-y-4",4,"ngIf"],[1,"space-y-4"],[4,"ngIf"],[4,"ngIf","ngIfElse"],["noPosts",""],[4,"ngFor","ngForOf","ngForTrackBy"],[1,"hover:underline",3,"routerLink"],[1,"mt-4"]],template:function(t,n){1&t&&(o.gc(0,m,5,3,"section",0),o.Wb(1,"async")),2&t&&o.Yb("ngIf",o.Xb(1,1,n.postsQuery$))},directives:[e.k,e.j,c.i],pipes:[e.b],encapsulation:2,changeDetection:0}),t})(),L=(()=>{class t{constructor(){}}return t.\u0275fac=function(n){return new(n||t)},t.\u0275cmp=o.Db({type:t,selectors:[["app-posts-manager"]],decls:9,vars:0,consts:[[1,"space-y-8"],[1,"text-xl","font-semibold"]],template:function(t,n){1&t&&(o.Mb(0,"section",0),o.Kb(1,"app-new-post"),o.Mb(2,"h1",1),o.ic(3,"Posts List"),o.Lb(),o.Kb(4,"app-posts-list"),o.Kb(5,"hr"),o.Mb(6,"h1",1),o.ic(7,"Posts List with duplicate subscription"),o.Lb(),o.Kb(8,"app-posts-list"),o.Lb())},directives:[l,h],encapsulation:2,changeDetection:0}),t})();var y=s("lJxs");function I(t,n){1&t&&(o.Mb(0,"small"),o.ic(1,"Refetching..."),o.Lb())}function M(t,n){if(1&t&&(o.Mb(0,"button",9),o.ic(1),o.Lb()),2&t){const t=n.ngIf,s=o.Vb().ngIf,e=o.Vb().ngIf;o.Yb("disabled",e.isLoading||s.isLoading||t.isLoading),o.zb(1),o.kc(" ",null!=t&&t.isLoading?"Updating...":"Edit"," ")}}function k(t,n){if(1&t){const t=o.Nb();o.Mb(0,"div",6),o.gc(1,M,2,2,"button",7),o.Wb(2,"async"),o.Mb(3,"button",8),o.Tb("click",function(){o.dc(t);const n=o.Vb().ngIf;return o.Vb().deletePost(null==n.data?null:n.data.id)}),o.ic(4),o.Lb(),o.Lb()}if(2&t){const t=n.ngIf,s=o.Vb().ngIf,e=o.Vb();o.zb(1),o.Yb("ngIf",o.Xb(2,3,e.updatePostMutation.state$)),o.zb(2),o.Yb("disabled",s.isLoading||t.isLoading),o.zb(1),o.kc(" ",null!=t&&t.isLoading?"Deleting...":"Delete"," ")}}function v(t,n){if(1&t&&(o.Mb(0,"section",1),o.Mb(1,"div"),o.Mb(2,"h1",2),o.ic(3),o.Lb(),o.gc(4,I,2,0,"small",3),o.Lb(),o.gc(5,k,5,5,"div",4),o.Wb(6,"async"),o.Mb(7,"pre",5),o.ic(8),o.Wb(9,"json"),o.Lb(),o.Lb()),2&t){const t=n.ngIf,s=o.Vb();o.zb(3),o.jc(null==t||null==t.data?null:t.data.name),o.zb(1),o.Yb("ngIf",t.isFetching),o.zb(1),o.Yb("ngIf",o.Xb(6,4,s.deletePostMutation.state$)),o.zb(3),o.jc(o.Xb(9,6,t.data))}}const P=[{path:"",component:L},{path:":id",component:(()=>{class t{constructor(t,n){this.route=t,this.router=n,this.postQuery$=Object(a.i)(this.route.params.pipe(Object(y.a)(t=>+t.id))),this.updatePostMutation=Object(a.l)(),this.deletePostMutation=Object(a.f)()}updatePost(t){}deletePost(t=0){this.deletePostMutation.dispatch(t),this.router.navigate(["/posts"])}}return t.\u0275fac=function(n){return new(n||t)(o.Jb(c.a),o.Jb(c.g))},t.\u0275cmp=o.Db({type:t,selectors:[["app-post-detail"]],decls:2,vars:3,consts:[["class","space-y-4",4,"ngIf"],[1,"space-y-4"],[1,"text-xl","font-semibold"],[4,"ngIf"],["class","flex items-center space-x-4",4,"ngIf"],[1,"bg-gray-200"],[1,"flex","items-center","space-x-4"],["class","btn-outline btn-primary",3,"disabled",4,"ngIf"],[1,"m-4","btn-outline","btn-primary",3,"disabled","click"],[1,"btn-outline","btn-primary",3,"disabled"]],template:function(t,n){1&t&&(o.gc(0,v,10,8,"section",0),o.Wb(1,"async")),2&t&&o.Yb("ngIf",o.Xb(1,1,n.postQuery$))},directives:[e.k],pipes:[e.b,e.f],encapsulation:2,changeDetection:0}),t})()}];let w=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=o.Hb({type:t}),t.\u0275inj=o.Gb({imports:[[c.j.forChild(P)],c.j]}),t})(),j=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=o.Hb({type:t}),t.\u0275inj=o.Gb({imports:[[e.c,w,i.d,i.h]]}),t})()}}]);