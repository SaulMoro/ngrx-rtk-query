"use strict";(self.webpackChunkngrx_rtk_query_app=self.webpackChunkngrx_rtk_query_app||[]).push([[536],{4536:(I,p,r)=>{r.r(p),r.d(p,{CounterModule:()=>k});var c=r(1368),s=r(4716),d=r(4328),a=r(4836),m=r(477),t=r(4496);const C=[{value:0,label:"0 - off"},{value:1e3,label:"1s"},{value:3e3,label:"3s"},{value:5e3,label:"5s"},{value:1e4,label:"10s"},{value:6e4,label:"1m"}];function h(n,u){if(1&n&&(t.I0R(0,"option",7),t.OEk(1),t.C$Y()),2&n){const i=u.$implicit;t.E7m("value",i.value),t.yG2(),t.oRS(" ",i.label," ")}}let g=(()=>{class n{constructor(){this.id="",this.pollingOptions=C,this.pollingInterval=(0,t.OCB)(this.pollingOptions[0].value),this.options=(0,t.S6b)(()=>({pollingInterval:this.pollingInterval()})),this.countQuery=(0,a.$j)(this.options),this.increment=(0,a.EW)(),this.decrement=(0,a.In)()}ngOnInit(){this.countQuery.fetch(this.id)}changePollingInterval(i){this.pollingInterval.set(+i)}incrementCounter(){this.increment.dispatch({id:this.id,amount:1})}decrementCounter(){this.decrement.dispatch({id:this.id,amount:1})}static#t=this.\u0275fac=function(o){return new(o||n)};static#n=this.\u0275cmp=t.In1({type:n,selectors:[["app-counter"]],inputs:{id:"id"},decls:12,vars:8,consts:[[1,"space-y-4"],[1,"text-md","font-medium"],[1,"flex","items-center","space-x-4"],[1,"btn-outline","btn-primary",3,"disabled","click"],[1,"text-3xl","font-bold"],[3,"ngModel","ngModelChange"],[3,"value",4,"ngFor","ngForOf"],[3,"value"]],template:function(o,e){1&o&&(t.I0R(0,"section",0)(1,"h1",1),t.OEk(2),t.C$Y(),t.I0R(3,"div",2)(4,"button",3),t.qCj("click",function(){return e.incrementCounter()}),t.OEk(5," + "),t.C$Y(),t.I0R(6,"span",4),t.OEk(7),t.C$Y(),t.I0R(8,"button",3),t.qCj("click",function(){return e.decrementCounter()}),t.OEk(9," - "),t.C$Y(),t.I0R(10,"select",5),t.qCj("ngModelChange",function(b){return e.changePollingInterval(b)}),t.yuY(11,h,2,2,"option",6),t.C$Y()()()),2&o&&(t.yG2(2),t.cNF(e.id),t.yG2(2),t.E7m("disabled",e.increment.state().isLoading),t.yG2(2),t.eAK("bg-green-100",e.countQuery.state().isFetching),t.yG2(),t.cNF((null==e.countQuery.state().data?null:e.countQuery.state().data.count)||0),t.yG2(),t.E7m("disabled",e.decrement.state().isLoading),t.yG2(2),t.E7m("ngModel",e.pollingInterval()),t.yG2(),t.E7m("ngForOf",e.pollingOptions))},dependencies:[c.ay,s.wd,s.GO,s.GC,s.ue,s._G],encapsulation:2,changeDetection:0})}return n})();function y(n,u){if(1&n&&(t.I0R(0,"div",11),t.wR5(1,"app-counter",12),t.C$Y()),2&n){const i=u.$implicit;t.yG2(),t.E7m("id",i)}}const f=[{path:"",component:(()=>{class n{constructor(){this.countQuery=(0,a.kp)(),this.increment=(0,a.mT)(),this.decrement=(0,a.Ab)(),this.counters=[]}addCounter(){this.counters=[...this.counters,(0,m.i0)()]}trackByFn(i,o){return o}static#t=this.\u0275fac=function(o){return new(o||n)};static#n=this.\u0275cmp=t.In1({type:n,selectors:[["app-counter-manager"]],decls:26,vars:7,consts:[[1,"space-y-8"],[1,"space-y-4"],[1,"text-xl","font-semibold"],[1,"flex","items-center","space-x-4"],[1,"btn-outline","btn-primary",3,"disabled","click"],[1,"text-3xl","font-bold"],[1,"btn-outline","btn-primary",3,"click"],[1,"mt-6","bg-gray-200","text-xs"],[1,"flex","items-center","space-x-8"],[1,"btn","btn-primary",3,"click"],["class","mt-6 w-full",4,"ngFor","ngForOf","ngForTrackBy"],[1,"mt-6","w-full"],[3,"id"]],template:function(o,e){1&o&&(t.I0R(0,"div",0)(1,"section",1)(2,"h1",2),t.OEk(3,"Main Counter"),t.C$Y(),t.I0R(4,"div")(5,"div",3)(6,"button",4),t.qCj("click",function(){return e.increment.dispatch(1)}),t.OEk(7," + "),t.C$Y(),t.I0R(8,"span",5),t.OEk(9),t.C$Y(),t.I0R(10,"button",6),t.qCj("click",function(){return e.decrement.dispatch(1)}),t.OEk(11,"-"),t.C$Y()(),t.I0R(12,"small"),t.OEk(13,"Decrease is a optimistic update!"),t.C$Y(),t.I0R(14,"p",7)(15,"code"),t.OEk(16),t.wVc(17,"json"),t.C$Y()()()(),t.I0R(18,"section",1),t.wR5(19,"hr"),t.I0R(20,"div",8)(21,"h1",2),t.OEk(22,"Counters List"),t.C$Y(),t.I0R(23,"button",9),t.qCj("click",function(){return e.addCounter()}),t.OEk(24,"Add individual counter"),t.C$Y()(),t.yuY(25,y,2,1,"div",10),t.C$Y()()),2&o&&(t.yG2(6),t.E7m("disabled",e.increment.state().isLoading),t.yG2(3),t.cNF((null==e.countQuery().data?null:e.countQuery().data.count)||0),t.yG2(7),t.cNF(t.kDX(17,5,e.countQuery())),t.yG2(9),t.E7m("ngForOf",e.counters)("ngForTrackBy",e.trackByFn))},dependencies:[c.ay,g,c.ED],encapsulation:2,changeDetection:0})}return n})()}];let v=(()=>{class n{static#t=this.\u0275fac=function(o){return new(o||n)};static#n=this.\u0275mod=t.a4G({type:n});static#e=this.\u0275inj=t.s3X({imports:[d.qQ.forChild(f),d.qQ]})}return n})(),k=(()=>{class n{static#t=this.\u0275fac=function(o){return new(o||n)};static#n=this.\u0275mod=t.a4G({type:n});static#e=this.\u0275inj=t.s3X({imports:[c.MD,v,s.y]})}return n})()}}]);