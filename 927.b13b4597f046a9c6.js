"use strict";(self.webpackChunkngrx_rtk_query_app=self.webpackChunkngrx_rtk_query_app||[]).push([[927],{6927:(M,g,i)=>{i.r(g),i.d(g,{CounterModule:()=>u});var c=i(6895),a=i(433),f=i(5737),C=i(2520),r=i(2953),n=i(4650),_=i(1135),b=i(4004);const h=[{value:0,label:"0 - off"},{value:1e3,label:"1s"},{value:3e3,label:"3s"},{value:5e3,label:"5s"},{value:1e4,label:"10s"},{value:6e4,label:"1m"}];function v(o,e){if(1&o){const t=n.EpF();n.TgZ(0,"button",7),n.NdJ("click",function(){n.CHM(t);const l=n.oxw();return n.KtG(l.incrementCounter())}),n._uU(1," + "),n.qZA()}2&o&&n.Q6J("disabled",e.ngIf.isLoading)}function Z(o,e){if(1&o&&(n.TgZ(0,"span",8),n._uU(1),n.qZA()),2&o){const t=e.ngIf;n.ekj("bg-green-100",t.isFetching),n.xp6(1),n.Oqu((null==t.data?null:t.data.count)||0)}}function y(o,e){if(1&o){const t=n.EpF();n.TgZ(0,"button",7),n.NdJ("click",function(){n.CHM(t);const l=n.oxw();return n.KtG(l.decrementCounter())}),n._uU(1," - "),n.qZA()}2&o&&n.Q6J("disabled",e.ngIf.isLoading)}function T(o,e){if(1&o&&(n.TgZ(0,"option",9),n._uU(1),n.qZA()),2&o){const t=e.$implicit;n.Q6J("value",t.value),n.xp6(1),n.hij(" ",t.label," ")}}class p{constructor(){this.id="",this.pollingOptions=h,this.pollingInterval=new _.X(this.pollingOptions[0].value),this.pollingInterval$=this.pollingInterval.asObservable(),this.options$=this.pollingInterval$.pipe((0,b.U)(e=>({pollingInterval:e}))),this.countQuery=(0,r.v)(this.options$),this.increment=(0,r.k9)(),this.decrement=(0,r.bG)()}ngOnInit(){this.countQuery.fetch(this.id)}changePollingInterval(e){this.pollingInterval.next(+e)}incrementCounter(){this.increment.dispatch({id:this.id,amount:1})}decrementCounter(){this.decrement.dispatch({id:this.id,amount:1})}}function x(o,e){if(1&o){const t=n.EpF();n.TgZ(0,"button",11),n.NdJ("click",function(){n.CHM(t);const l=n.oxw();return n.KtG(l.increment.dispatch(1))}),n._uU(1," + "),n.qZA()}2&o&&n.Q6J("disabled",e.ngIf.isLoading)}function A(o,e){if(1&o&&(n.TgZ(0,"span",12),n._uU(1),n.qZA()),2&o){const t=e.ngIf;n.xp6(1),n.Oqu((null==t.data?null:t.data.count)||0)}}function J(o,e){if(1&o&&(n.TgZ(0,"div",13),n._UZ(1,"app-counter",14),n.qZA()),2&o){const t=e.$implicit;n.xp6(1),n.Q6J("id",t)}}p.\u0275fac=function(e){return new(e||p)},p.\u0275cmp=n.Xpm({type:p,selectors:[["app-counter"]],inputs:{id:"id"},decls:13,vars:14,consts:[[1,"space-y-4"],[1,"text-md","font-medium"],[1,"flex","items-center","space-x-4"],["class","btn-outline btn-primary",3,"disabled","click",4,"ngIf"],["class","text-3xl font-bold",3,"bg-green-100",4,"ngIf"],[3,"ngModel","ngModelChange"],[3,"value",4,"ngFor","ngForOf"],[1,"btn-outline","btn-primary",3,"disabled","click"],[1,"text-3xl","font-bold"],[3,"value"]],template:function(e,t){1&e&&(n.TgZ(0,"section",0)(1,"h1",1),n._uU(2),n.qZA(),n.TgZ(3,"div",2),n.YNc(4,v,2,1,"button",3),n.ALo(5,"async"),n.YNc(6,Z,2,3,"span",4),n.ALo(7,"async"),n.YNc(8,y,2,1,"button",3),n.ALo(9,"async"),n.TgZ(10,"select",5),n.NdJ("ngModelChange",function(l){return t.changePollingInterval(l)}),n.ALo(11,"async"),n.YNc(12,T,2,2,"option",6),n.qZA()()()),2&e&&(n.xp6(2),n.Oqu(t.id),n.xp6(2),n.Q6J("ngIf",n.lcZ(5,6,t.increment.state$)),n.xp6(2),n.Q6J("ngIf",n.lcZ(7,8,t.countQuery.state$)),n.xp6(2),n.Q6J("ngIf",n.lcZ(9,10,t.decrement.state$)),n.xp6(2),n.Q6J("ngModel",n.lcZ(11,12,t.pollingInterval$)),n.xp6(2),n.Q6J("ngForOf",t.pollingOptions))},dependencies:[c.sg,c.O5,a.YN,a.Kr,a.EJ,a.JJ,a.On,c.Ov],encapsulation:2,changeDetection:0});class d{constructor(){this.countQuery$=(0,r.X2)(),this.increment=(0,r.lE)(),this.decrement=(0,r.pn)(),this.counters=[]}addCounter(){this.counters=[...this.counters,(0,C.x0)()]}trackByFn(e,t){return t}}d.\u0275fac=function(e){return new(e||d)},d.\u0275cmp=n.Xpm({type:d,selectors:[["app-counter-manager"]],decls:27,vars:13,consts:[[1,"space-y-8"],[1,"space-y-4"],[1,"text-xl","font-semibold"],[1,"flex","items-center","space-x-4"],["class","btn-outline btn-primary",3,"disabled","click",4,"ngIf"],["class","text-3xl font-bold",4,"ngIf"],[1,"btn-outline","btn-primary",3,"click"],[1,"mt-6","bg-gray-200","text-xs"],[1,"flex","items-center","space-x-8"],[1,"btn","btn-primary",3,"click"],["class","mt-6 w-full",4,"ngFor","ngForOf","ngForTrackBy"],[1,"btn-outline","btn-primary",3,"disabled","click"],[1,"text-3xl","font-bold"],[1,"mt-6","w-full"],[3,"id"]],template:function(e,t){1&e&&(n.TgZ(0,"div",0)(1,"section",1)(2,"h1",2),n._uU(3,"Main Counter"),n.qZA(),n.TgZ(4,"div")(5,"div",3),n.YNc(6,x,2,1,"button",4),n.ALo(7,"async"),n.YNc(8,A,2,1,"span",5),n.ALo(9,"async"),n.TgZ(10,"button",6),n.NdJ("click",function(){return t.decrement.dispatch(1)}),n._uU(11,"-"),n.qZA()(),n.TgZ(12,"small"),n._uU(13,"Decrease is a optimistic update!"),n.qZA(),n.TgZ(14,"p",7)(15,"code"),n._uU(16),n.ALo(17,"json"),n.ALo(18,"async"),n.qZA()()()(),n.TgZ(19,"section",1),n._UZ(20,"hr"),n.TgZ(21,"div",8)(22,"h1",2),n._uU(23,"Counters List"),n.qZA(),n.TgZ(24,"button",9),n.NdJ("click",function(){return t.addCounter()}),n._uU(25,"Add individual counter"),n.qZA()(),n.YNc(26,J,2,1,"div",10),n.qZA()()),2&e&&(n.xp6(6),n.Q6J("ngIf",n.lcZ(7,5,t.increment.state$)),n.xp6(2),n.Q6J("ngIf",n.lcZ(9,7,t.countQuery$)),n.xp6(8),n.Oqu(n.lcZ(17,9,n.lcZ(18,11,t.countQuery$))),n.xp6(10),n.Q6J("ngForOf",t.counters)("ngForTrackBy",t.trackByFn))},dependencies:[c.sg,c.O5,p,c.Ov,c.Ts],encapsulation:2,changeDetection:0});const I=[{path:"",component:d}];class s{}s.\u0275fac=function(e){return new(e||s)},s.\u0275mod=n.oAB({type:s}),s.\u0275inj=n.cJS({imports:[f.Bz.forChild(I),f.Bz]});class u{}u.\u0275fac=function(e){return new(e||u)},u.\u0275mod=n.oAB({type:u}),u.\u0275inj=n.cJS({imports:[c.ez,s,a.u5]})}}]);