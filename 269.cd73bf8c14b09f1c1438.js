"use strict";(self.webpackChunkngrx_rtk_query_app=self.webpackChunkngrx_rtk_query_app||[]).push([[269],{2269:(T,l,a)=>{a.r(l),a.d(l,{LazyModule:()=>A});var u=a(8583),c=a(3092),p=a(4272),i=a(1242),t=a(7716);function m(n,r){if(1&n){const e=t.EpF();t.TgZ(0,"button",3),t.NdJ("click",function(){return t.CHM(e),t.oxw().incrementCounter()}),t._uU(1," + "),t.qZA()}if(2&n){const e=r.ngIf,o=t.oxw();t.Q6J("disabled",e.isLoading||(null==o.counterData?null:o.counterData.isUninitialized))}}function d(n,r){if(1&n){const e=t.EpF();t.TgZ(0,"button",3),t.NdJ("click",function(){return t.CHM(e),t.oxw().decrementCounter()}),t._uU(1," - "),t.qZA()}if(2&n){const e=r.ngIf,o=t.oxw();t.Q6J("disabled",e.isLoading||(null==o.counterData?null:o.counterData.isUninitialized))}}let f=(()=>{class n{constructor(){this.increment=(0,i.k9)(),this.decrement=(0,i.bG)()}incrementCounter(){var e,o;this.increment.dispatch({id:null!==(o=null===(e=this.counterData)||void 0===e?void 0:e.originalArgs)&&void 0!==o?o:"",amount:1})}decrementCounter(){var e,o;this.decrement.dispatch({id:null!==(o=null===(e=this.counterData)||void 0===e?void 0:e.originalArgs)&&void 0!==o?o:"",amount:1})}}return n.\u0275fac=function(e){return new(e||n)},n.\u0275cmp=t.Xpm({type:n,selectors:[["app-counter-row"]],inputs:{counterData:"counterData"},decls:7,vars:9,consts:[[1,"flex","items-center","mt-4","space-x-4"],["class","btn-outline btn-primary",3,"disabled","click",4,"ngIf"],[1,"text-3xl","font-bold"],[1,"btn-outline","btn-primary",3,"disabled","click"]],template:function(e,o){1&e&&(t.TgZ(0,"div",0),t.YNc(1,m,2,1,"button",1),t.ALo(2,"async"),t.TgZ(3,"span",2),t._uU(4),t.qZA(),t.YNc(5,d,2,1,"button",1),t.ALo(6,"async"),t.qZA()),2&e&&(t.xp6(1),t.Q6J("ngIf",t.lcZ(2,5,o.increment.state$)),t.xp6(2),t.ekj("bg-green-100",null==o.counterData?null:o.counterData.isFetching),t.xp6(1),t.Oqu((null==o.counterData||null==o.counterData.data?null:o.counterData.data.count)||0),t.xp6(1),t.Q6J("ngIf",t.lcZ(6,7,o.decrement.state$)))},directives:[u.O5],pipes:[u.Ov],encapsulation:2,changeDetection:0}),n})();function g(n,r){if(1&n){const e=t.EpF();t.TgZ(0,"div",3),t.TgZ(1,"form",4),t.NdJ("ngSubmit",function(){t.CHM(e);const s=t.oxw();return s.startCounterById(s.form.value)}),t.TgZ(2,"h1",5),t._uU(3,"Start Lazy Counter"),t.qZA(),t.TgZ(4,"div"),t._UZ(5,"input",6),t.TgZ(6,"button",7),t._uU(7),t.qZA(),t.TgZ(8,"label",8),t._UZ(9,"input",9),t.TgZ(10,"span"),t._uU(11,"Prefer Cache (No fetch if counter exists with same id in cache)"),t.qZA(),t.qZA(),t.qZA(),t.qZA(),t.TgZ(12,"section",10),t.TgZ(13,"h1",11),t._uU(14),t.qZA(),t._UZ(15,"app-counter-row",12),t.qZA(),t.qZA()}if(2&n){const e=r.ngIf,o=t.oxw();t.xp6(1),t.Q6J("formGroup",o.form),t.xp6(5),t.Q6J("disabled",o.form.invalid||e.isLoading),t.xp6(1),t.hij(" ",e.isLoading?"Starting...":"Start Counter"," "),t.xp6(7),t.hij("Current id: ",e.originalArgs||"Not Started",""),t.xp6(1),t.Q6J("counterData",e)}}function y(n,r){if(1&n&&(t.TgZ(0,"section",10),t.TgZ(1,"h1",11),t._uU(2,"Duplicate state (Share state, subscription & selectFromResult)"),t.qZA(),t.TgZ(3,"h1",13),t._uU(4,"Use in same component (not subscripted by self)"),t.qZA(),t._UZ(5,"app-counter-row",12),t.qZA()),2&n){const e=r.ngIf;t.xp6(5),t.Q6J("counterData",e)}}function _(n,r){if(1&n&&(t.TgZ(0,"section",10),t.TgZ(1,"h1",11),t._uU(2,"Select from state (Share state & subscription, another selectFromResult)"),t.qZA(),t.TgZ(3,"h1",13),t._uU(4,"Use in same component or child components (not subscripted by self)"),t.qZA(),t._UZ(5,"app-counter-row",12),t.qZA()),2&n){const e=r.ngIf;t.xp6(5),t.Q6J("counterData",e)}}function Z(n,r){if(1&n&&(t.TgZ(0,"section",10),t.TgZ(1,"h1",11),t._uU(2," Related Query (Share cache data / another subscription & selectFromResult or Options) "),t.qZA(),t.TgZ(3,"h1",13),t._uU(4,"Use anywhere (subscripted by self), skip subscribe with uninitialized value"),t.qZA(),t._UZ(5,"app-counter-row",12),t.qZA()),2&n){const e=r.ngIf;t.xp6(5),t.Q6J("counterData",e)}}const{getCountById:h}=i.JI,C=[{path:"",component:(()=>{class n{constructor(e){this.formBuilder=e,this.countQuery=(0,i.v)(),this.selectFromState$=h.useQueryState(this.countQuery.lastArg$),this.countQuery$=(0,i._o)(this.countQuery.lastArg$),this.form=this.formBuilder.group({id:["",[c.kI.required,c.kI.minLength(2)]],preferCacheValue:[!1]})}startCounterById({id:e,preferCacheValue:o}){this.countQuery.fetch(e,{preferCacheValue:o})}}return n.\u0275fac=function(e){return new(e||n)(t.Y36(c.qu))},n.\u0275cmp=t.Xpm({type:n,selectors:[["app-lazy"]],decls:9,vars:12,consts:[["class","space-y-6",4,"ngIf"],[1,"mt-8","space-y-8"],["class","space-y-4",4,"ngIf"],[1,"space-y-6"],[3,"formGroup","ngSubmit"],[1,"text-xl","font-semibold"],["type","text","placeholder","Type counter id","formControlName","id"],["type","submit",1,"m-4","btn","btn-primary",3,"disabled"],["for","preferCacheValue",1,"space-x-2","text-sm"],["id","preferCacheValue","type","checkbox","formControlName","preferCacheValue"],[1,"space-y-4"],[1,"font-medium","text-md"],[3,"counterData"],[1,"text-sm"]],template:function(e,o){1&e&&(t.YNc(0,g,16,5,"div",0),t.ALo(1,"async"),t.TgZ(2,"div",1),t.YNc(3,y,6,1,"section",2),t.ALo(4,"async"),t.YNc(5,_,6,1,"section",2),t.ALo(6,"async"),t.YNc(7,Z,6,1,"section",2),t.ALo(8,"async"),t.qZA()),2&e&&(t.Q6J("ngIf",t.lcZ(1,4,o.countQuery.state$)),t.xp6(3),t.Q6J("ngIf",t.lcZ(4,6,o.countQuery.state$)),t.xp6(2),t.Q6J("ngIf",t.lcZ(6,8,o.selectFromState$)),t.xp6(2),t.Q6J("ngIf",t.lcZ(8,10,o.countQuery$)))},directives:[u.O5,c._Y,c.JL,c.sg,c.Fj,c.JJ,c.u,c.Wl,f],pipes:[u.Ov],encapsulation:2,changeDetection:0}),n})()}];let b=(()=>{class n{}return n.\u0275fac=function(e){return new(e||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[[p.Bz.forChild(C)],p.Bz]}),n})(),A=(()=>{class n{}return n.\u0275fac=function(e){return new(e||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[[u.ez,b,c.u5,c.UX]]}),n})()}}]);