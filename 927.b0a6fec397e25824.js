"use strict";(self.webpackChunkngrx_rtk_query_app=self.webpackChunkngrx_rtk_query_app||[]).push([[927],{6927:(I,s,l)=>{l.r(s),l.d(s,{CounterModule:()=>M});var r=l(4755),u=l(5030),p=l(7984),d=l(2520),a=l(2953),n=l(2223),m=l(1135),g=l(4004);const f=[{value:0,label:"0 - off"},{value:1e3,label:"1s"},{value:3e3,label:"3s"},{value:5e3,label:"5s"},{value:1e4,label:"10s"},{value:6e4,label:"1m"}];function C(t,o){if(1&t){const e=n.EpF();n.TgZ(0,"button",7),n.NdJ("click",function(){n.CHM(e);const c=n.oxw();return n.KtG(c.incrementCounter())}),n._uU(1," + "),n.qZA()}2&t&&n.Q6J("disabled",o.ngIf.isLoading)}function _(t,o){if(1&t&&(n.TgZ(0,"span",8),n._uU(1),n.qZA()),2&t){const e=o.ngIf;n.ekj("bg-green-100",e.isFetching),n.xp6(1),n.Oqu((null==e.data?null:e.data.count)||0)}}function b(t,o){if(1&t){const e=n.EpF();n.TgZ(0,"button",7),n.NdJ("click",function(){n.CHM(e);const c=n.oxw();return n.KtG(c.decrementCounter())}),n._uU(1," - "),n.qZA()}2&t&&n.Q6J("disabled",o.ngIf.isLoading)}function h(t,o){if(1&t&&(n.TgZ(0,"option",9),n._uU(1),n.qZA()),2&t){const e=o.$implicit;n.Q6J("value",e.value),n.xp6(1),n.hij(" ",e.label," ")}}let v=(()=>{class t{constructor(){this.id="",this.pollingOptions=f,this.pollingInterval=new m.X(this.pollingOptions[0].value),this.pollingInterval$=this.pollingInterval.asObservable(),this.options$=this.pollingInterval$.pipe((0,g.U)(e=>({pollingInterval:e}))),this.countQuery=(0,a.v)(this.options$),this.increment=(0,a.k9)(),this.decrement=(0,a.bG)()}ngOnInit(){this.countQuery.fetch(this.id)}changePollingInterval(e){this.pollingInterval.next(+e)}incrementCounter(){this.increment.dispatch({id:this.id,amount:1})}decrementCounter(){this.decrement.dispatch({id:this.id,amount:1})}}return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=n.Xpm({type:t,selectors:[["app-counter"]],inputs:{id:"id"},decls:13,vars:14,consts:[[1,"space-y-4"],[1,"text-md","font-medium"],[1,"flex","items-center","space-x-4"],["class","btn-outline btn-primary",3,"disabled","click",4,"ngIf"],["class","text-3xl font-bold",3,"bg-green-100",4,"ngIf"],[3,"ngModel","ngModelChange"],[3,"value",4,"ngFor","ngForOf"],[1,"btn-outline","btn-primary",3,"disabled","click"],[1,"text-3xl","font-bold"],[3,"value"]],template:function(e,i){1&e&&(n.TgZ(0,"section",0)(1,"h1",1),n._uU(2),n.qZA(),n.TgZ(3,"div",2),n.YNc(4,C,2,1,"button",3),n.ALo(5,"async"),n.YNc(6,_,2,3,"span",4),n.ALo(7,"async"),n.YNc(8,b,2,1,"button",3),n.ALo(9,"async"),n.TgZ(10,"select",5),n.NdJ("ngModelChange",function(J){return i.changePollingInterval(J)}),n.ALo(11,"async"),n.YNc(12,h,2,2,"option",6),n.qZA()()()),2&e&&(n.xp6(2),n.Oqu(i.id),n.xp6(2),n.Q6J("ngIf",n.lcZ(5,6,i.increment.state$)),n.xp6(2),n.Q6J("ngIf",n.lcZ(7,8,i.countQuery.state$)),n.xp6(2),n.Q6J("ngIf",n.lcZ(9,10,i.decrement.state$)),n.xp6(2),n.Q6J("ngModel",n.lcZ(11,12,i.pollingInterval$)),n.xp6(2),n.Q6J("ngForOf",i.pollingOptions))},dependencies:[r.sg,r.O5,u.YN,u.Kr,u.EJ,u.JJ,u.On,r.Ov],encapsulation:2,changeDetection:0}),t})();function Z(t,o){if(1&t){const e=n.EpF();n.TgZ(0,"button",11),n.NdJ("click",function(){n.CHM(e);const c=n.oxw();return n.KtG(c.increment.dispatch(1))}),n._uU(1," + "),n.qZA()}2&t&&n.Q6J("disabled",o.ngIf.isLoading)}function y(t,o){if(1&t&&(n.TgZ(0,"span",12),n._uU(1),n.qZA()),2&t){const e=o.ngIf;n.xp6(1),n.Oqu((null==e.data?null:e.data.count)||0)}}function T(t,o){if(1&t&&(n.TgZ(0,"div",13),n._UZ(1,"app-counter",14),n.qZA()),2&t){const e=o.$implicit;n.xp6(1),n.Q6J("id",e)}}const x=[{path:"",component:(()=>{class t{constructor(){this.countQuery$=(0,a.X2)(),this.increment=(0,a.lE)(),this.decrement=(0,a.pn)(),this.counters=[]}addCounter(){this.counters=[...this.counters,(0,d.x0)()]}trackByFn(e,i){return i}}return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=n.Xpm({type:t,selectors:[["app-counter-manager"]],decls:27,vars:13,consts:[[1,"space-y-8"],[1,"space-y-4"],[1,"text-xl","font-semibold"],[1,"flex","items-center","space-x-4"],["class","btn-outline btn-primary",3,"disabled","click",4,"ngIf"],["class","text-3xl font-bold",4,"ngIf"],[1,"btn-outline","btn-primary",3,"click"],[1,"mt-6","bg-gray-200","text-xs"],[1,"flex","items-center","space-x-8"],[1,"btn","btn-primary",3,"click"],["class","mt-6 w-full",4,"ngFor","ngForOf","ngForTrackBy"],[1,"btn-outline","btn-primary",3,"disabled","click"],[1,"text-3xl","font-bold"],[1,"mt-6","w-full"],[3,"id"]],template:function(e,i){1&e&&(n.TgZ(0,"div",0)(1,"section",1)(2,"h1",2),n._uU(3,"Main Counter"),n.qZA(),n.TgZ(4,"div")(5,"div",3),n.YNc(6,Z,2,1,"button",4),n.ALo(7,"async"),n.YNc(8,y,2,1,"span",5),n.ALo(9,"async"),n.TgZ(10,"button",6),n.NdJ("click",function(){return i.decrement.dispatch(1)}),n._uU(11,"-"),n.qZA()(),n.TgZ(12,"small"),n._uU(13,"Decrease is a optimistic update!"),n.qZA(),n.TgZ(14,"p",7)(15,"code"),n._uU(16),n.ALo(17,"json"),n.ALo(18,"async"),n.qZA()()()(),n.TgZ(19,"section",1),n._UZ(20,"hr"),n.TgZ(21,"div",8)(22,"h1",2),n._uU(23,"Counters List"),n.qZA(),n.TgZ(24,"button",9),n.NdJ("click",function(){return i.addCounter()}),n._uU(25,"Add individual counter"),n.qZA()(),n.YNc(26,T,2,1,"div",10),n.qZA()()),2&e&&(n.xp6(6),n.Q6J("ngIf",n.lcZ(7,5,i.increment.state$)),n.xp6(2),n.Q6J("ngIf",n.lcZ(9,7,i.countQuery$)),n.xp6(8),n.Oqu(n.lcZ(17,9,n.lcZ(18,11,i.countQuery$))),n.xp6(10),n.Q6J("ngForOf",i.counters)("ngForTrackBy",i.trackByFn))},dependencies:[r.sg,r.O5,v,r.Ov,r.Ts],encapsulation:2,changeDetection:0}),t})()}];let A=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=n.oAB({type:t}),t.\u0275inj=n.cJS({imports:[p.Bz.forChild(x),p.Bz]}),t})(),M=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=n.oAB({type:t}),t.\u0275inj=n.cJS({imports:[r.ez,A,u.u5]}),t})()}}]);