(self.webpackChunkngrx_rtk_query_app=self.webpackChunkngrx_rtk_query_app||[]).push([[703],{7703:(t,n,e)=>{"use strict";e.r(n),e.d(n,{PostsModule:()=>M});var o=e(8583),s=e(3092),i=e(4272),a=e(3215),r=e(9755),c=e(685),p=e(7716);const u=(0,r.ni)({baseUrl:"/"}),l=(0,r.XD)(u,{maxRetries:6}),d=(0,c.LC)({reducerPath:"postsApi",baseQuery:l,tagTypes:["Posts"],endpoints:t=>({getPosts:t.query({query:()=>({url:"posts"}),providesTags:t=>t?[...t.map(({id:t})=>({type:"Posts",id:t})),{type:"Posts",id:"LIST"}]:[{type:"Posts",id:"LIST"}]}),addPost:t.mutation({query:t=>({url:"posts",method:"POST",body:t}),invalidatesTags:[{type:"Posts",id:"LIST"}]}),getPost:t.query({query:t=>`posts/${t}`,providesTags:(t,n,e)=>[{type:"Posts",id:e}]}),updatePost:t.mutation({query:t=>{const{id:n}=t;return{url:`posts/${n}`,method:"PUT",body:function(t,n){var e={};for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&n.indexOf(o)<0&&(e[o]=t[o]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(o=Object.getOwnPropertySymbols(t);s<o.length;s++)n.indexOf(o[s])<0&&Object.prototype.propertyIsEnumerable.call(t,o[s])&&(e[o[s]]=t[o[s]])}return e}(t,["id"])}},invalidatesTags:(t,n,{id:e})=>[{type:"Posts",id:e}]}),deletePost:t.mutation({query:t=>({url:`posts/${t}`,method:"DELETE"}),invalidatesTags:(t,n,e)=>[{type:"Posts",id:e}]})})}),{useAddPostMutation:g,useDeletePostMutation:f,useGetPostQuery:m,useGetPostsQuery:h,useUpdatePostMutation:y}=d;let x=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=p.oAB({type:t}),t.\u0275inj=p.cJS({imports:[[a.Aw.forFeature(d.reducerPath,d.reducer,{metaReducers:[d.metareducer]})]]}),t})();const Z=function(t){return["/posts",t]};function b(t,n){if(1&t&&(p.TgZ(0,"li"),p.TgZ(1,"a",6),p._uU(2),p.qZA(),p.qZA()),2&t){const t=n.$implicit;p.xp6(1),p.Q6J("routerLink",p.VKq(2,Z,t.id)),p.xp6(1),p.Oqu(t.name)}}function P(t,n){if(1&t&&(p.TgZ(0,"div"),p.YNc(1,b,3,4,"li",5),p.qZA()),2&t){const t=p.oxw().ngIf,n=p.oxw(2);p.xp6(1),p.Q6J("ngForOf",t)("ngForTrackBy",n.trackByFn)}}function I(t,n){1&t&&(p.TgZ(0,"p",7),p._uU(1,"No posts :("),p.qZA())}function A(t,n){if(1&t&&(p.ynx(0),p.YNc(1,P,2,2,"div",2),p.YNc(2,I,2,0,"ng-template",null,4,p.W1O),p.BQk()),2&t){const t=n.ngIf,e=p.MAs(3);p.xp6(1),p.Q6J("ngIf",t.length)("ngIfElse",e)}}function w(t,n){1&t&&(p.TgZ(0,"small"),p._uU(1,"Loading..."),p.qZA())}function T(t,n){if(1&t&&(p.TgZ(0,"section",1),p.YNc(1,A,4,2,"ng-container",2),p.YNc(2,w,2,0,"ng-template",null,3,p.W1O),p.qZA()),2&t){const t=n.ngIf,e=p.MAs(3);p.xp6(1),p.Q6J("ngIf",t.data)("ngIfElse",e)}}let q=(()=>{class t{constructor(){this.postsQuery$=h()}trackByFn(t,n){return n.id}}return t.\u0275fac=function(n){return new(n||t)},t.\u0275cmp=p.Xpm({type:t,selectors:[["app-posts-list"]],decls:2,vars:3,consts:[["class","space-y-4",4,"ngIf"],[1,"space-y-4"],[4,"ngIf","ngIfElse"],["loading",""],["emptyPosts",""],[4,"ngFor","ngForOf","ngForTrackBy"],[1,"hover:underline",3,"routerLink"],[1,"mt-4"]],template:function(t,n){1&t&&(p.YNc(0,T,4,2,"section",0),p.ALo(1,"async")),2&t&&p.Q6J("ngIf",p.lcZ(1,1,n.postsQuery$))},directives:[o.O5,o.sg,i.yS],pipes:[o.Ov],encapsulation:2,changeDetection:0}),t})();function v(t,n){if(1&t){const t=p.EpF();p.TgZ(0,"button",4),p.NdJ("click",function(){return p.CHM(t),p.oxw().addNewPost()}),p._uU(1),p.qZA()}if(2&t){const t=n.ngIf,e=p.oxw();p.Q6J("disabled",e.postNameFormControl.invalid||t.isLoading),p.xp6(1),p.hij(" ",t.isLoading?"Adding...":"Add Post"," ")}}let J=(()=>{class t{constructor(){this.addPost=g(),this.postNameFormControl=new s.NI("",[s.kI.required])}addNewPost(){this.addPost.dispatch({name:this.postNameFormControl.value}).unwrap().then(()=>this.postNameFormControl.setValue(""))}}return t.\u0275fac=function(n){return new(n||t)},t.\u0275cmp=p.Xpm({type:t,selectors:[["app-posts-manager"]],decls:12,vars:4,consts:[[1,"space-y-4"],["id","name","placeholder","New post name","type","text",3,"formControl"],["class","m-4 btn btn-primary",3,"disabled","click",4,"ngIf"],[1,"text-xl","font-semibold"],[1,"m-4","btn","btn-primary",3,"disabled","click"]],template:function(t,n){1&t&&(p.TgZ(0,"section",0),p.TgZ(1,"div"),p._UZ(2,"input",1),p.YNc(3,v,2,2,"button",2),p.ALo(4,"async"),p.qZA(),p.TgZ(5,"h1",3),p._uU(6,"Posts List"),p.qZA(),p._UZ(7,"app-posts-list"),p._UZ(8,"hr"),p.TgZ(9,"h1",3),p._uU(10,"Posts List with duplicate subscription"),p.qZA(),p._UZ(11,"app-posts-list"),p.qZA()),2&t&&(p.xp6(2),p.Q6J("formControl",n.postNameFormControl),p.xp6(1),p.Q6J("ngIf",p.lcZ(4,2,n.addPost.state$)))},directives:[s.Fj,s.JJ,s.oH,o.O5,q],pipes:[o.Ov],encapsulation:2,changeDetection:0}),t})();var N=e(9922);function L(t,n){1&t&&(p.TgZ(0,"small"),p._uU(1,"Loading..."),p.qZA())}function Q(t,n){if(1&t){const t=p.EpF();p.TgZ(0,"button",10),p.NdJ("click",function(){return p.CHM(t),p.oxw(4).toggleEdit()}),p._uU(1),p.qZA()}if(2&t){const t=n.ngIf,e=p.oxw().ngIf,o=p.oxw(2).ngIf;p.Q6J("disabled",o.isLoading||e.isLoading||t.isLoading),p.xp6(1),p.hij(" ",null!=t&&t.isLoading?"Updating...":"Edit"," ")}}function F(t,n){if(1&t){const t=p.EpF();p.TgZ(0,"div",8),p.YNc(1,Q,2,2,"button",9),p.ALo(2,"async"),p.TgZ(3,"button",10),p.NdJ("click",function(){return p.CHM(t),p.oxw(3).deletePost()}),p._uU(4),p.qZA(),p.TgZ(5,"button",10),p.NdJ("click",function(){return p.CHM(t),p.oxw(2).ngIf.refetch()}),p._uU(6),p.qZA(),p.qZA()}if(2&t){const t=n.ngIf,e=p.oxw(2).ngIf,o=p.oxw();p.xp6(1),p.Q6J("ngIf",p.lcZ(2,5,o.updatePostMutation.state$)),p.xp6(2),p.Q6J("disabled",e.isLoading||t.isLoading),p.xp6(1),p.hij(" ",null!=t&&t.isLoading?"Deleting...":"Delete"," "),p.xp6(1),p.Q6J("disabled",e.isFetching),p.xp6(1),p.hij(" ",e.isFetching?"Fetching...":"Refresh"," ")}}function k(t,n){if(1&t&&(p.ynx(0),p.YNc(1,F,7,7,"div",7),p.ALo(2,"async"),p.BQk()),2&t){const t=p.oxw(2);p.xp6(1),p.Q6J("ngIf",p.lcZ(2,1,t.deletePostMutation.state$))}}function U(t,n){if(1&t){const t=p.EpF();p.TgZ(0,"div",12),p._UZ(1,"input",13),p.TgZ(2,"button",14),p.NdJ("click",function(){return p.CHM(t),p.oxw(3).updatePost()}),p._uU(3),p.qZA(),p.TgZ(4,"button",14),p.NdJ("click",function(){return p.CHM(t),p.oxw(3).toggleEdit()}),p._uU(5,"Cancel"),p.qZA(),p.qZA()}if(2&t){const t=n.ngIf,e=p.oxw(3);p.xp6(1),p.Q6J("formControl",e.postFormControl),p.xp6(1),p.Q6J("disabled",t.isLoading),p.xp6(1),p.hij(" ",null!=t&&t.isLoading?"Updating...":"Update"," "),p.xp6(1),p.Q6J("disabled",t.isLoading)}}function _(t,n){if(1&t&&(p.YNc(0,U,6,4,"div",11),p.ALo(1,"async")),2&t){const t=p.oxw(2);p.Q6J("ngIf",p.lcZ(1,1,t.updatePostMutation.state$))}}function C(t,n){if(1&t&&(p.TgZ(0,"section",1),p.TgZ(1,"div"),p.TgZ(2,"h1",2),p._uU(3),p.qZA(),p.YNc(4,L,2,0,"small",3),p.qZA(),p.YNc(5,k,3,3,"ng-container",4),p.YNc(6,_,2,3,"ng-template",null,5,p.W1O),p.TgZ(8,"pre",6),p._uU(9),p.ALo(10,"json"),p.qZA(),p.qZA()),2&t){const t=n.ngIf,e=p.MAs(7),o=p.oxw();p.xp6(3),p.Oqu(null==t||null==t.data?null:t.data.name),p.xp6(1),p.Q6J("ngIf",t.isFetching),p.xp6(1),p.Q6J("ngIf",!o.isEditing)("ngIfElse",e),p.xp6(4),p.Oqu(p.lcZ(10,5,t.data))}}const O=[{path:"",component:J},{path:":id",component:(()=>{class t{constructor(t,n){this.route=t,this.router=n,this.postQuery$=m(+this.route.snapshot.params.id,{pollingInterval:5e3}).pipe((0,N.b)(t=>{var n,e;return this.postFormControl.setValue(null!==(e=null===(n=t.data)||void 0===n?void 0:n.name)&&void 0!==e?e:"")})),this.updatePostMutation=y(),this.deletePostMutation=f(),this.postFormControl=new s.NI(""),this.isEditing=!1}updatePost(){this.updatePostMutation.dispatch({id:+this.route.snapshot.params.id,name:this.postFormControl.value}).unwrap().then(()=>this.toggleEdit())}deletePost(){this.deletePostMutation.dispatch(+this.route.snapshot.params.id).unwrap().then(()=>this.router.navigate(["/posts"])).catch(()=>console.error("Error deleting Post"))}toggleEdit(){this.isEditing=!this.isEditing}}return t.\u0275fac=function(n){return new(n||t)(p.Y36(i.gz),p.Y36(i.F0))},t.\u0275cmp=p.Xpm({type:t,selectors:[["app-post-detail"]],decls:2,vars:3,consts:[["class","space-y-4",4,"ngIf"],[1,"space-y-4"],[1,"text-xl","font-semibold"],[4,"ngIf"],[4,"ngIf","ngIfElse"],["editionSection",""],[1,"bg-gray-200"],["class","flex items-center space-x-4",4,"ngIf"],[1,"flex","items-center","space-x-4"],["class","btn-outline btn-primary",3,"disabled","click",4,"ngIf"],[1,"btn-outline","btn-primary",3,"disabled","click"],["class","space-x-4",4,"ngIf"],[1,"space-x-4"],["type","text",3,"formControl"],[1,"btn","btn-primary",3,"disabled","click"]],template:function(t,n){1&t&&(p.YNc(0,C,11,7,"section",0),p.ALo(1,"async")),2&t&&p.Q6J("ngIf",p.lcZ(1,1,n.postQuery$))},directives:[o.O5,s.Fj,s.JJ,s.oH],pipes:[o.Ov,o.Ts],encapsulation:2,changeDetection:0}),t})()}];let E=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=p.oAB({type:t}),t.\u0275inj=p.cJS({imports:[[i.Bz.forChild(O)],i.Bz]}),t})(),M=(()=>{class t{}return t.\u0275fac=function(n){return new(n||t)},t.\u0275mod=p.oAB({type:t}),t.\u0275inj=p.cJS({imports:[[o.ez,E,s.u5,s.UX,x]]}),t})()}}]);