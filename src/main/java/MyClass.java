public class MyClass {
    private Integer a;
    private Integer b;

    public MyClass(Integer a, Integer b) {
        this.a = a;
        this.b = b;
    }

    public Integer sum(){
        return this.a+this.b;
    }

    public Integer mul(){
        return this.a*this.b;
    }

    public Integer getA() {
        return a;
    }

    public void setA(Integer a) {
        this.a = a;
    }

    public Integer getB() {
        return b;
    }

    public void setB(Integer b) {
        this.b = b;
    }
}
