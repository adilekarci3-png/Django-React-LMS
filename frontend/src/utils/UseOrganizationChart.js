//import overviewData from "./datasource";

const UseOrganizationChart = (members) => {

console.log(members);
ej.base.enableRipple(true);
/**
 * OverView
 */
ej.diagrams.Diagram.Inject(ej.diagrams.DataBinding, ej.diagrams.HierarchicalTree);
//Funtion to add the Template of the Node.

function setNodeTemplate(obj, diagram) {    
    var content = new ej.diagrams.StackPanel();
    content.id = obj.id + '_outerstack';
    content.orientation = 'Horizontal';
    content.style.strokeColor = 'gray';
    content.padding = { left: 5, right: 10, top: 5, bottom: 5 };

    var image = new ej.diagrams.ImageElement();
    image.width = 50; image.height = 50;
    image.style.strokeColor = 'none';
    image.source = obj.data.ImageUrl;
    image.id = obj.id + '_pic';

    var innerStack = new ej.diagrams.StackPanel();
    innerStack.style.strokeColor = 'none';
    innerStack.margin = { left: 5, right: 0, top: 0, bottom: 0 };
    innerStack.id = obj.id + '_innerstack';

    var text = new ej.diagrams.TextElement();
    text.id = obj.id + '_text1';
    text.content = obj.data.Name;
    text.style.bold = true;    

    var desigText = new ej.diagrams.TextElement();
    debugger;
    desigText.id = obj.id + '_desig';
    desigText.content = obj.data.Designation;    
    
    var emailText = new ej.diagrams.TextElement();
    emailText.id = obj.id + '_email';
    emailText.content = obj.data.Email; 

    var phoneText = new ej.diagrams.TextElement();
    phoneText.id = obj.id + '_phone';
    phoneText.content = obj.data.Phone; 

    innerStack.children = [text, desigText,emailText,phoneText];    
    content.children = [image, innerStack];
    return content;
}

    
//Initializtion of the diagram.
var diagram = new ej.diagrams.Diagram({
    width: '100%', height: '590px', scrollSettings: { scrollLimit: 'Infinity' },
    //Sets the constraints of the SnapSettings
    snapSettings: { constraints: ej.diagrams.SnapConstraints.None },
    //Configrues organizational chart layout
    layout: {
        type: 'OrganizationalChart', margin: { top: 20 },
        getLayoutInfo: function (node, tree) {
            if (!tree.hasSubTree) {
                tree.orientation = 'Vertical';
                tree.type = 'Right';
            }
        }
    },
    //Sets the parent and child relationship of DataSource.
    dataSourceSettings: {
        id: 'Id', parentId: 'ReportingPerson', dataManager: new ej.data.DataManager(members)
    },
    //Sets the default values of connectors.
    getConnectorDefaults: function (connector, diagram) {
               
        console.log(members);
        // console.log(overviewData);
        
        connector.targetDecorator.shape = 'None';
        connector.type = 'Orthogonal';
        connector.style.strokeColor = 'gray';
        return connector;
    },
    //customization of the node.
    setNodeTemplate: function (obj, diagram) {
        return setNodeTemplate(obj, diagram);
    },
    tool: ej.diagrams.DiagramTools.ZoomPan
});

// fetchOrganizationMember();
diagram.appendTo('#diagram');
}

export default UseOrganizationChart;