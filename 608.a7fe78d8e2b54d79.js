"use strict";(self.webpackChunkngrx_rtk_query_app=self.webpackChunkngrx_rtk_query_app||[]).push([[608],{3608:($,d,r)=>{r.r(d),r.d(d,{PostsModule:()=>Y});var c=r(1368),a=r(4716),p=r(6512),l=r(4328);const g=(0,p._)({baseUrl:"/"}),_=(0,p.c9)(g,{maxRetries:6}),m=(0,p.KS)({reducerPath:"postsApi",baseQuery:_,tagTypes:["Posts"],endpoints:e=>({getPosts:e.query({query:()=>({url:"posts"}),providesTags:i=>i?[...i.map(({id:s})=>({type:"Posts",id:s})),{type:"Posts",id:"LIST"}]:[{type:"Posts",id:"LIST"}]}),addPost:e.mutation({query:i=>({url:"posts",method:"POST",body:i}),invalidatesTags:[{type:"Posts",id:"LIST"}]}),getPost:e.query({query:i=>`posts/${i}`,providesTags:(i,s,o)=>[{type:"Posts",id:o}]}),updatePost:e.mutation({query:i=>{const{id:s,...o}=i;return{url:`posts/${s}`,method:"PUT",body:o}},invalidatesTags:(i,s,{id:o})=>[{type:"Posts",id:o}]}),deletePost:e.mutation({query:i=>({url:`posts/${i}`,method:"DELETE"}),invalidatesTags:(i,s,o)=>[{type:"Posts",id:o}]})})}),{useAddPostMutation:y,useDeletePostMutation:h,useGetPostQuery:P,useGetPostsQuery:f,useUpdatePostMutation:C}=m;var t=r(4496);const E=e=>["/posts",e];function G(e,i){if(1&e&&(t.I0R(0,"li")(1,"a",5),t.OEk(2),t.C$Y()()),2&e){const s=i.$implicit;t.yG2(),t.E7m("routerLink",t.S45(2,E,s.id)),t.yG2(),t.cNF(s.name)}}function I(e,i){if(1&e&&(t.I0R(0,"div"),t.yuY(1,G,3,4,"li",4),t.C$Y()),2&e){const s=t.GaO().ngIf,o=t.GaO();t.yG2(),t.E7m("ngForOf",s)("ngForTrackBy",o.trackByFn)}}function k(e,i){1&e&&(t.I0R(0,"p",6),t.OEk(1,"No posts :("),t.C$Y())}function T(e,i){if(1&e&&(t.SAx(0),t.yuY(1,I,2,2,"div",1)(2,k,2,0,"ng-template",null,3,t.gJz),t.k70()),2&e){const s=i.ngIf,o=t.Gew(3);t.yG2(),t.E7m("ngIf",s.length)("ngIfElse",o)}}function R(e,i){1&e&&(t.I0R(0,"small"),t.OEk(1,"Loading..."),t.C$Y())}let b=(()=>{class e{constructor(){this.postsQuery=f()}trackByFn(s,o){return o.id}static#t=this.\u0275fac=function(o){return new(o||e)};static#e=this.\u0275cmp=t.In1({type:e,selectors:[["app-posts-list"]],decls:4,vars:2,consts:[[1,"space-y-4"],[4,"ngIf","ngIfElse"],["loading",""],["emptyPosts",""],[4,"ngFor","ngForOf","ngForTrackBy"],[1,"hover:underline",3,"routerLink"],[1,"mt-4"]],template:function(o,n){if(1&o&&(t.I0R(0,"section",0),t.yuY(1,T,4,2,"ng-container",1)(2,R,2,0,"ng-template",null,2,t.gJz),t.C$Y()),2&o){const u=t.Gew(3);t.yG2(),t.E7m("ngIf",n.postsQuery().data)("ngIfElse",u)}},dependencies:[c.ay,c.u_,l.ER],encapsulation:2,changeDetection:0})}return e})();function v(e,i){1&e&&(t.I0R(0,"small"),t.OEk(1,"Loading..."),t.C$Y())}function F(e,i){if(1&e){const s=t.KQA();t.SAx(0),t.I0R(1,"div",6)(2,"button",7),t.qCj("click",function(){t.usT(s);const n=t.GaO();return t.CGJ(n.toggleEdit())}),t.OEk(3),t.C$Y(),t.I0R(4,"button",7),t.qCj("click",function(){t.usT(s);const n=t.GaO();return t.CGJ(n.deletePost())}),t.OEk(5),t.C$Y(),t.I0R(6,"button",7),t.qCj("click",function(){t.usT(s);const n=t.GaO();return t.CGJ(n.postQuery().refetch())}),t.OEk(7),t.C$Y()(),t.k70()}if(2&e){const s=t.GaO();t.yG2(2),t.E7m("disabled",s.postQuery().isLoading||s.deletePostMutation.state().isLoading||s.updatePostMutation.state().isLoading),t.yG2(),t.oRS(" ",s.updatePostMutation.state().isLoading?"Updating...":"Edit"," "),t.yG2(),t.E7m("disabled",s.postQuery().isLoading||s.deletePostMutation.state().isLoading),t.yG2(),t.oRS(" ",s.deletePostMutation.state().isLoading?"Deleting...":"Delete"," "),t.yG2(),t.E7m("disabled",s.postQuery().isFetching),t.yG2(),t.oRS(" ",s.postQuery().isFetching?"Fetching...":"Refresh"," ")}}function O(e,i){if(1&e){const s=t.KQA();t.I0R(0,"div",8),t.wR5(1,"input",9),t.I0R(2,"button",10),t.qCj("click",function(){t.usT(s);const n=t.GaO();return t.CGJ(n.updatePost())}),t.OEk(3),t.C$Y(),t.I0R(4,"button",10),t.qCj("click",function(){t.usT(s);const n=t.GaO();return t.CGJ(n.toggleEdit())}),t.OEk(5," Cancel "),t.C$Y()()}if(2&e){const s=t.GaO();t.yG2(),t.E7m("formControl",s.postFormControl),t.yG2(),t.E7m("disabled",s.updatePostMutation.state().isLoading),t.yG2(),t.oRS(" ",s.updatePostMutation.state().isLoading?"Updating...":"Update"," "),t.yG2(),t.E7m("disabled",s.updatePostMutation.state().isLoading)}}const M=[{path:"",component:(()=>{class e{constructor(){this.addPost=y(),this.postNameFormControl=new a.yM("",[a.AQ.required])}addNewPost(){this.addPost.dispatch({name:this.postNameFormControl.value}).unwrap().then(()=>this.postNameFormControl.setValue(""))}static#t=this.\u0275fac=function(o){return new(o||e)};static#e=this.\u0275cmp=t.In1({type:e,selectors:[["app-posts-manager"]],decls:12,vars:3,consts:[[1,"space-y-4"],["id","name","placeholder","New post name","type","text",3,"formControl"],[1,"btn","btn-primary","m-4",3,"disabled","click"],[1,"text-xl","font-semibold"]],template:function(o,n){1&o&&(t.I0R(0,"section",0)(1,"div"),t.wR5(2,"input",1),t.I0R(3,"button",2),t.qCj("click",function(){return n.addNewPost()}),t.OEk(4),t.C$Y()(),t.I0R(5,"h1",3),t.OEk(6,"Posts List"),t.C$Y(),t.wR5(7,"app-posts-list")(8,"hr"),t.I0R(9,"h1",3),t.OEk(10,"Posts List with duplicate subscription"),t.C$Y(),t.wR5(11,"app-posts-list"),t.C$Y()),2&o&&(t.yG2(2),t.E7m("formControl",n.postNameFormControl),t.yG2(),t.E7m("disabled",n.postNameFormControl.invalid||n.addPost.state().isLoading),t.yG2(),t.oRS(" ",n.addPost.state().isLoading?"Adding...":"Add Post"," "))},dependencies:[a.ot,a.ue,a.ug,b],encapsulation:2,changeDetection:0})}return e})()},{path:":id",component:(()=>{class e{#t;constructor(s,o){this.route=s,this.router=o,this.postQuery=P(+this.route.snapshot.params.id,{pollingInterval:5e3}),this.#t=(0,t.o3l)(()=>{const n=this.postQuery();this.postFormControl.setValue(n.data?.name??"")}),this.updatePostMutation=C(),this.deletePostMutation=h(),this.postFormControl=new a.yM(""),this.isEditing=(0,t.OCB)(!1)}updatePost(){this.updatePostMutation.dispatch({id:+this.route.snapshot.params.id,name:this.postFormControl.value}).unwrap().then(()=>this.toggleEdit())}deletePost(){this.deletePostMutation.dispatch(+this.route.snapshot.params.id).unwrap().then(()=>this.router.navigate(["/posts"])).catch(()=>console.error("Error deleting Post"))}toggleEdit(){this.isEditing.update(s=>!s)}static#e=this.\u0275fac=function(o){return new(o||e)(t.GI1(l.gV),t.GI1(l.E5))};static#s=this.\u0275cmp=t.In1({type:e,selectors:[["app-post-detail"]],decls:11,vars:7,consts:[[1,"space-y-4"],[1,"text-xl","font-semibold"],[4,"ngIf"],[4,"ngIf","ngIfElse"],["editionSection",""],[1,"bg-gray-200"],[1,"flex","items-center","space-x-4"],[1,"btn-outline","btn-primary",3,"disabled","click"],[1,"space-x-4"],["type","text",3,"formControl"],[1,"btn","btn-primary",3,"disabled","click"]],template:function(o,n){if(1&o&&(t.I0R(0,"section",0)(1,"div")(2,"h1",1),t.OEk(3),t.C$Y(),t.yuY(4,v,2,0,"small",2),t.C$Y(),t.yuY(5,F,8,6,"ng-container",3)(6,O,6,4,"ng-template",null,4,t.gJz),t.I0R(8,"pre",5),t.OEk(9),t.wVc(10,"json"),t.C$Y()()),2&o){const u=t.Gew(7);t.yG2(3),t.cNF(null==n.postQuery().data?null:n.postQuery().data.name),t.yG2(),t.E7m("ngIf",n.postQuery().isFetching),t.yG2(),t.E7m("ngIf",!n.isEditing())("ngIfElse",u),t.yG2(4),t.cNF(t.kDX(10,5,n.postQuery().data))}},dependencies:[c.u_,a.ot,a.ue,a.ug,c.ED],encapsulation:2,changeDetection:0})}return e})()}];let Q=(()=>{class e{static#t=this.\u0275fac=function(o){return new(o||e)};static#e=this.\u0275mod=t.a4G({type:e});static#s=this.\u0275inj=t.s3X({imports:[l.qQ.forChild(M),l.qQ]})}return e})(),Y=(()=>{class e{static#t=this.\u0275fac=function(o){return new(o||e)};static#e=this.\u0275mod=t.a4G({type:e});static#s=this.\u0275inj=t.s3X({providers:[(0,p.QR)(m)],imports:[c.MD,Q,a.y,a.sl]})}return e})()}}]);