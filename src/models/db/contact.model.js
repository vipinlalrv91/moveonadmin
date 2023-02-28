module.exports = (sequelize,DataTypes) =>{
    const Contact = sequelize.define("contacts",{
      contact_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name:{
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      message:{
        type: DataTypes.TEXT,
        allowNull: false,
      }
    },
    {freezeTableName: true,
     timestamps:true});

    return Contact;
}