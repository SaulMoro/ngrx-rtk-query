(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{YanU:function(t,n,e){"use strict";e.r(n),e.d(n,"PostsModule",function(){return S});var o=e("ofXK"),s=e("3Pt+"),c=e("tyNb"),i=e("l7P3"),a=e("JC0d"),r=e("nSkL");async function b(t=0,n=5){const e=Math.min(t,n),o=~~((Math.random()+.4)*(300<<e));await new Promise(t=>setTimeout(n=>t(n),o))}const l=Object.assign((t,n)=>async(e,o,s)=>{const c={maxRetries:5,backoff:b,...n,...s};let i=0;for(;;)try{const n=await t(e,o,s);if(n.error)throw new r.a(n);return n}catch(a){if(i++,a.throwImmediately||i>c.maxRetries){if(a instanceof r.a)return a.value;throw a}await c.backoff(i,c.maxRetries)}},{fail:function(t){throw Object.assign(new r.a({error:t}),{throwImmediately:!0})}});var d=e("1bI8"),u=e("fXoL");const p=l(Object(a.a)({baseUrl:"/"}),{maxRetries:6}),f=Object(d.b)({reducerPath:"postsApi",baseQuery:p,entityTypes:["Posts"],endpoints:t=>({getPosts:t.query({query:()=>({url:"posts"}),provides:t=>[...t.map(({id:t})=>({type:"Posts",id:t})),{type:"Posts",id:"LIST"}]}),addPost:t.mutation({query:t=>({url:"posts",method:"POST",body:t}),invalidates:[{type:"Posts",id:"LIST"}]}),getPost:t.query({query:t=>`posts/${t}`,provides:(t,n)=>[{type:"Posts",id:n}]}),updatePost:t.mutation({query:t=>{const{id:n}=t;return{url:`posts/${n}`,method:"PUT",body:function(t,n){var e={};for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&n.indexOf(o)<0&&(e[o]=t[o]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(t);s<o.length;s++)n.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(t,o[s])&&(e[o[s]]=t[o[s]])}return e}(t,["id"])}},invalidates:(t,{id:n})=>[{type:"Posts",id:n}]}),deletePost:t.mutation({query:t=>({url:`posts/${t}`,method:"DELETE"}),invalidates:(t,n)=>[{type:"Posts",id:n}]})})}),{useAddPostMutation:g,useDeletePostMutation:m,useGetPostQuery:h,useGetPostsQuery:y,useUpdatePostMutation:P}=f;let I=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=u.Hb({type:t}),t.\u0275inj=u.Gb({imports:[[i.i.forFeature(f.reducerPath,f.reducer,{metaReducers:[f.metareducer]})]]}),t})();const k=function(t){return["/posts",t]};function O(t,n){if(1&t&&(u.Ob(0,"li"),u.Ob(1,"a",6),u.mc(2),u.Nb(),u.Nb()),2&t){const t=n.$implicit;u.zb(1),u.cc("routerLink",u.ec(2,k,t.id)),u.zb(1),u.nc(t.name)}}function v(t,n){if(1&t&&(u.Ob(0,"div"),u.kc(1,O,3,4,"li",5),u.Nb()),2&t){const t=u.Zb().ngIf,n=u.Zb(2);u.zb(1),u.cc("ngForOf",t)("ngForTrackBy",n.trackByFn)}}function w(t,n){1&t&&(u.Ob(0,"p",7),u.mc(1,"No posts :("),u.Nb())}function N(t,n){if(1&t&&(u.Mb(0),u.kc(1,v,2,2,"div",2),u.kc(2,w,2,0,"ng-template",null,4,u.lc),u.Lb()),2&t){const t=n.ngIf,e=u.gc(3);u.zb(1),u.cc("ngIf",t.length)("ngIfElse",e)}}function L(t,n){1&t&&(u.Ob(0,"small"),u.mc(1,"Loading..."),u.Nb())}function z(t,n){if(1&t&&(u.Ob(0,"section",1),u.kc(1,N,4,2,"ng-container",2),u.kc(2,L,2,0,"ng-template",null,3,u.lc),u.Nb()),2&t){const t=n.ngIf,e=u.gc(3);u.zb(1),u.cc("ngIf",t.data)("ngIfElse",e)}}let F=(()=>{class t{constructor(){this.postsQuery$=y()}trackByFn(t,n){return n.id}}return t.\u0275fac=function(n){return new(n||t)},t.\u0275cmp=u.Db({type:t,selectors:[["app-posts-list"]],decls:2,vars:3,consts:[["class","space-y-4",4,"ngIf"],[1,"space-y-4"],[4,"ngIf","ngIfElse"],["loading",""],["emptyPosts",""],[4,"ngFor","ngForOf","ngForTrackBy"],[1,"hover:underline",3,"routerLink"],[1,"mt-4"]],template:function(t,n){1&t&&(u.kc(0,z,4,2,"section",0),u.ac(1,"async")),2&t&&u.cc("ngIf",u.bc(1,1,n.postsQuery$))},directives:[o.l,o.k,c.j],pipes:[o.b],encapsulation:2,changeDetection:0}),t})();function E(t,n){if(1&t){const t=u.Pb();u.Ob(0,"button",4),u.Vb("click",function(){return u.hc(t),u.Zb().addNewPost()}),u.mc(1),u.Nb()}if(2&t){const t=n.ngIf,e=u.Zb();u.cc("disabled",e.postNameFormControl.invalid||t.isLoading),u.zb(1),u.oc(" ",t.isLoading?"Adding...":"Add Post"," ")}}let x=(()=>{class t{constructor(){this.addPost=g(),this.postNameFormControl=new s.d("",[s.o.required])}addNewPost(){this.addPost.dispatch({name:this.postNameFormControl.value}).unwrap().then(()=>this.postNameFormControl.setValue(""))}}return t.\u0275fac=function(n){return new(n||t)},t.\u0275cmp=u.Db({type:t,selectors:[["app-posts-manager"]],decls:12,vars:4,consts:[[1,"space-y-4"],["id","name","placeholder","New post name","type","text",3,"formControl"],["class","m-4 btn btn-primary",3,"disabled","click",4,"ngIf"],[1,"text-xl","font-semibold"],[1,"m-4","btn","btn-primary",3,"disabled","click"]],template:function(t,n){1&t&&(u.Ob(0,"section",0),u.Ob(1,"div"),u.Kb(2,"input",1),u.kc(3,E,2,2,"button",2),u.ac(4,"async"),u.Nb(),u.Ob(5,"h1",3),u.mc(6,"Posts List"),u.Nb(),u.Kb(7,"app-posts-list"),u.Kb(8,"hr"),u.Ob(9,"h1",3),u.mc(10,"Posts List with duplicate subscription"),u.Nb(),u.Kb(11,"app-posts-list"),u.Nb()),2&t&&(u.zb(2),u.cc("formControl",n.postNameFormControl),u.zb(1),u.cc("ngIf",u.bc(4,2,n.addPost.state$)))},directives:[s.b,s.i,s.e,o.l,F],pipes:[o.b],encapsulation:2,changeDetection:0}),t})();var Z=e("vkgz");function C(t,n){1&t&&(u.Ob(0,"small"),u.mc(1,"Loading..."),u.Nb())}function M(t,n){if(1&t){const t=u.Pb();u.Ob(0,"button",10),u.Vb("click",function(){return u.hc(t),u.Zb(4).toggleEdit()}),u.mc(1),u.Nb()}if(2&t){const t=n.ngIf,e=u.Zb().ngIf,o=u.Zb(2).ngIf;u.cc("disabled",o.isLoading||e.isLoading||t.isLoading),u.zb(1),u.oc(" ",null!=t&&t.isLoading?"Updating...":"Edit"," ")}}function j(t,n){if(1&t){const t=u.Pb();u.Ob(0,"div",8),u.kc(1,M,2,2,"button",9),u.ac(2,"async"),u.Ob(3,"button",10),u.Vb("click",function(){return u.hc(t),u.Zb(3).deletePost()}),u.mc(4),u.Nb(),u.Ob(5,"button",10),u.Vb("click",function(){return u.hc(t),u.Zb(2).ngIf.refetch()}),u.mc(6),u.Nb(),u.Nb()}if(2&t){const t=n.ngIf,e=u.Zb(2).ngIf,o=u.Zb();u.zb(1),u.cc("ngIf",u.bc(2,5,o.updatePostMutation.state$)),u.zb(2),u.cc("disabled",e.isLoading||t.isLoading),u.zb(1),u.oc(" ",null!=t&&t.isLoading?"Deleting...":"Delete"," "),u.zb(1),u.cc("disabled",e.isFetching),u.zb(1),u.oc(" ",e.isFetching?"Fetching...":"Refresh"," ")}}function $(t,n){if(1&t&&(u.Mb(0),u.kc(1,j,7,7,"div",7),u.ac(2,"async"),u.Lb()),2&t){const t=u.Zb(2);u.zb(1),u.cc("ngIf",u.bc(2,1,t.deletePostMutation.state$))}}function D(t,n){if(1&t){const t=u.Pb();u.Ob(0,"div",12),u.Kb(1,"input",13),u.Ob(2,"button",14),u.Vb("click",function(){return u.hc(t),u.Zb(3).updatePost()}),u.mc(3),u.Nb(),u.Ob(4,"button",14),u.Vb("click",function(){return u.hc(t),u.Zb(3).toggleEdit()}),u.mc(5,"Cancel"),u.Nb(),u.Nb()}if(2&t){const t=n.ngIf,e=u.Zb(3);u.zb(1),u.cc("formControl",e.postFormControl),u.zb(1),u.cc("disabled",t.isLoading),u.zb(1),u.oc(" ",null!=t&&t.isLoading?"Updating...":"Update"," "),u.zb(1),u.cc("disabled",t.isLoading)}}function T(t,n){if(1&t&&(u.kc(0,D,6,4,"div",11),u.ac(1,"async")),2&t){const t=u.Zb(2);u.cc("ngIf",u.bc(1,1,t.updatePostMutation.state$))}}function q(t,n){if(1&t&&(u.Ob(0,"section",1),u.Ob(1,"div"),u.Ob(2,"h1",2),u.mc(3),u.Nb(),u.kc(4,C,2,0,"small",3),u.Nb(),u.kc(5,$,3,3,"ng-container",4),u.kc(6,T,2,3,"ng-template",null,5,u.lc),u.Ob(8,"pre",6),u.mc(9),u.ac(10,"json"),u.Nb(),u.Nb()),2&t){const t=n.ngIf,e=u.gc(7),o=u.Zb();u.zb(3),u.nc(null==t||null==t.data?null:t.data.name),u.zb(1),u.cc("ngIf",t.isFetching),u.zb(1),u.cc("ngIf",!o.isEditing)("ngIfElse",e),u.zb(4),u.nc(u.bc(10,5,t.data))}}const V=[{path:"",component:x},{path:":id",component:(()=>{class t{constructor(t,n){this.route=t,this.router=n,this.postQuery$=h(+this.route.snapshot.params.id).pipe(Object(Z.a)(t=>{var n,e;return this.postFormControl.setValue(null!==(e=null===(n=t.data)||void 0===n?void 0:n.name)&&void 0!==e?e:"")})),this.updatePostMutation=P(),this.deletePostMutation=m(),this.postFormControl=new s.d(""),this.isEditing=!1}updatePost(){this.updatePostMutation.dispatch({id:+this.route.snapshot.params.id,name:this.postFormControl.value}).unwrap().then(()=>this.toggleEdit())}deletePost(){this.deletePostMutation.dispatch(+this.route.snapshot.params.id).unwrap().then(()=>this.router.navigate(["/posts"])).catch(()=>console.error("Error deleting Post"))}toggleEdit(){this.isEditing=!this.isEditing}}return t.\u0275fac=function(n){return new(n||t)(u.Jb(c.a),u.Jb(c.g))},t.\u0275cmp=u.Db({type:t,selectors:[["app-post-detail"]],decls:2,vars:3,consts:[["class","space-y-4",4,"ngIf"],[1,"space-y-4"],[1,"text-xl","font-semibold"],[4,"ngIf"],[4,"ngIf","ngIfElse"],["editionSection",""],[1,"bg-gray-200"],["class","flex items-center space-x-4",4,"ngIf"],[1,"flex","items-center","space-x-4"],["class","btn-outline btn-primary",3,"disabled","click",4,"ngIf"],[1,"btn-outline","btn-primary",3,"disabled","click"],["class","space-x-4",4,"ngIf"],[1,"space-x-4"],["type","text",3,"formControl"],[1,"btn","btn-primary",3,"disabled","click"]],template:function(t,n){1&t&&(u.kc(0,q,11,7,"section",0),u.ac(1,"async")),2&t&&u.cc("ngIf",u.bc(1,1,n.postQuery$))},directives:[o.l,s.b,s.i,s.e],pipes:[o.b,o.f],encapsulation:2,changeDetection:0}),t})()}];let Q=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=u.Hb({type:t}),t.\u0275inj=u.Gb({imports:[[c.k.forChild(V)],c.k]}),t})(),S=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=u.Hb({type:t}),t.\u0275inj=u.Gb({imports:[[o.c,Q,s.h,s.m,I]]}),t})()}}]);