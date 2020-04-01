export default
`
<div>
  <h1 class="path"><%= path %></h1>
  <ul class="item-container">
    <%_ files.forEach((e) => { _%>
    <li class="item">
      <div class="img-container">
        <img class="image" src="<%= e.uri %>" />
      </div>
      <input
        class="name"
        title="<%= e.basename %>"
        value="<%= e.basename %>"
        readonly="readonly"
      />
    </li>
    <%_ }) _%>
  </ul>
</div>
`;
