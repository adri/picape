import Layout from "../components/Layout";
import RecipeList from "../apps/RecipeList";
import EssentialList from "../apps/EssentialList";
import OrderList from "../apps/OrderList";
import withData from "../lib/withData";
import React from "react";
import Anchor from "../components/Anchor";

export default withData(({ data }) => (
  <Layout title="Picape">
    <div className="row">
      <div className="col-md-9 border border-right-0">
        <Anchor target="order" icon="fa-angle-double-down" />
        <Anchor target="essentials" icon="fa-caret-down" />
        <RecipeList showEdit={true} id="recipes" />
        <Anchor target="recipes" icon="fa-caret-up" />
        <Anchor target="order" icon="fa-caret-down" />
        <EssentialList id="essentials" />
      </div>
      <div className="col-md-3 order-column">
        <Anchor target="recipes" icon="fa-angle-double-up" />
        <Anchor target="essentials" icon="fa-caret-up " />
        <OrderList id="order" />
      </div>
    </div>
  </Layout>
));
