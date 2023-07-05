export default class SourceControlProfile {
    constructor(name, pluginClass, rootNode) {
        this.name = name;
        this.Type = pluginClass;
        this._rootNode = rootNode;
    }
}
