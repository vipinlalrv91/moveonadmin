module.exports = (sequelize,DataTypes) =>{
    const Service = sequelize.define("services",{
      service_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      short_title:{
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      description:{
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
      }
    },
    {freezeTableName: true,
     timestamps:true});

    return Service;
}